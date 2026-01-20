package api

import (
	"encoding/json"
	"net/http"

	"github.com/PedroFranca404/chat-app/config"
	"github.com/PedroFranca404/chat-app/repository"
	"github.com/PedroFranca404/chat-app/schemas"
)

func HandleUpdateUser(w http.ResponseWriter, r *http.Request) {
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
		Name      string `json:"name"`
		Status    string `json:"status"`
		AvatarUrl string `json:"avatar_url"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	updatedUser, err := repository.UpdateUser(currentUser.Id, req.Name, req.Status, req.AvatarUrl)
	if err != nil {
		http.Error(w, "Failed to update user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Update Session Cache
	SessionCache.Set(cookie.Value, updatedUser)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedUser)
}
