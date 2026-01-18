package api

import (
	"encoding/json"
	"net/http"

	"github.com/PedroFranca404/chat-app/config"
	"github.com/PedroFranca404/chat-app/repository"
	"github.com/PedroFranca404/chat-app/schemas"
	"github.com/google/uuid"
)

func HandleCreateConversation(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	cookie, err := r.Cookie("client_id")
	if err != nil || cookie.Value == "" {
		http.Error(w, "Unauthorized: No session found", http.StatusUnauthorized)
		return
	}

	var currentUser schemas.Users
	if err := config.DB.Where("client_id = ?", cookie.Value).First(&currentUser).Error; err != nil {
		http.Error(w, "Unauthorized: Invalid session", http.StatusUnauthorized)
		return
	}

	var req struct {
		Name      string   `json:"name"`
		IsGroup   bool     `json:"is_group"`
		Usernames []string `json:"usernames"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	if req.IsGroup && req.Name == "" {
		http.Error(w, "Group name is required", http.StatusBadRequest)
		return
	}

	if len(req.Usernames) == 0 {
		http.Error(w, "At least one username is required", http.StatusBadRequest)
		return
	}

	var participants []schemas.Users
	if err := config.DB.Where("name IN ?", req.Usernames).Find(&participants).Error; err != nil {
		http.Error(w, "Internal server error {"+err.Error()+"}", http.StatusInternalServerError)
		return
	}

	if len(participants) != len(req.Usernames) {
		http.Error(w, "One or more users not found", http.StatusBadRequest)
		return
	}

	var participantsIds []uuid.UUID
	participantsIds = append(participantsIds, currentUser.Id)
	for i := range participants {
		participantsIds = append(participantsIds, participants[i].Id)
	}

	newConv, err := repository.CreateConversation(req.Name, req.IsGroup, participantsIds)
	if err != nil {
		http.Error(w, "Failed to create conversation: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newConv)
}

func HandleGetConversations(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	cookie, err := r.Cookie("client_id")
	if err != nil || cookie.Value == "" {
		http.Error(w, "Unauthorized: No session found", http.StatusUnauthorized)
		return
	}

	var currentUser schemas.Users
	if err := config.DB.Where("client_id = ?", cookie.Value).First(&currentUser).Error; err != nil {
		http.Error(w, "Unauthorized: Invalid session", http.StatusUnauthorized)
		return
	}

	conversations, err := repository.GetConversations(currentUser.Id)
	if err != nil {
		http.Error(w, "Failed to get conversations: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(conversations)
}
