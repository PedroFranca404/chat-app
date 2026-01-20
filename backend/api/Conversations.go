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

func HandleHideConversation(w http.ResponseWriter, r *http.Request) {
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
		ConversationID uuid.UUID `json:"conversation_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	if err := config.DB.Model(&schemas.Participants{}).
		Where("conversation_id = ? AND user_id = ?", req.ConversationID, currentUser.Id).
		Update("hidden", true).Error; err != nil {
		http.Error(w, "Failed to hide conversation: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Conversation hidden successfully"})
}

func HandleUpdateConversation(w http.ResponseWriter, r *http.Request) {
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
		ConversationID uuid.UUID `json:"conversation_id"`
		Name           string    `json:"name"`
		Description    string    `json:"description"`
		AvatarUrl      string    `json:"avatar_url"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	var participant schemas.Participants
	if err := config.DB.Where("conversation_id = ? AND user_id = ?", req.ConversationID, currentUser.Id).First(&participant).Error; err != nil {
		http.Error(w, "Unauthorized: You are not a member of this group", http.StatusUnauthorized)
		return
	}

	if participant.Role != "admin" {
		http.Error(w, "Unauthorized: Only admins can update group details", http.StatusUnauthorized)
		return
	}

	updatedConv, err := repository.UpdateConversation(req.ConversationID, req.Name, req.Description, req.AvatarUrl)
	if err != nil {
		http.Error(w, "Failed to update conversation: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(updatedConv)
}

func HandleLeaveConversation(hub *Hub, w http.ResponseWriter, r *http.Request) {
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
		ConversationID uuid.UUID `json:"conversation_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	// Create system message
	if msg, err := repository.AddSystemMessage(currentUser.Id, req.ConversationID, currentUser.Name+" left the group."); err == nil {
		msgBytes, _ := json.Marshal(msg)
		hub.broadcast <- msgBytes
	}

	if err := repository.LeaveConversation(req.ConversationID, currentUser.Id); err != nil {
		http.Error(w, "Failed to leave conversation: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Left conversation successfully"})
}
