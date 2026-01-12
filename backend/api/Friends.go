package auth

import (
	"encoding/json"
	"net/http"

	"github.com/PedroFranca404/chat-app/config"
	"github.com/PedroFranca404/chat-app/schemas"
)

func HandleGetFriends(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	cookie, err := r.Cookie("client_id")
	if err != nil || cookie.Value == "" {
		http.Error(w, "Unauthorized: No session found", http.StatusUnauthorized)
		return
	}

	var user schemas.Users
	if err := config.DB.Where("client_id = ?", cookie.Value).First(&user).Error; err != nil {
		http.Error(w, "Unauthorized: Invalid session", http.StatusUnauthorized)
		return
	}

	var friends []schemas.Users
	if err = config.DB.Model(&user).Association("Friends").Find(&friends); err != nil {
		http.Error(w, "Error fetching friends", http.StatusInternalServerError)
		return
	}

	type FriendResponse struct {
		Id   string `json:"id"`
		Name string `json:"name"`
	}

	var response []FriendResponse
	for _, friend := range friends {
		response = append(response, FriendResponse{
			Id:   friend.Id.String(),
			Name: friend.Name,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func HandleAddFriend(w http.ResponseWriter, r *http.Request) {
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
		Username string `json:"username"`
	}
	if err:= json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Body", http.StatusBadRequest)
		return
	}

	var friendToAdd schemas.Users
	if err := config.DB.Where("name = ?", req.Username).First(&friendToAdd).Error; err != nil {
		http.Error(w, "Friend not found", http.StatusNotFound)
		return
	}

	if currentUser.Id == friendToAdd.Id {
		http.Error(w, "You can't add yourself", http.StatusBadRequest)
		return
	}

	if err := config.DB.Model(&currentUser).Association("Friends").Append(&friendToAdd); err != nil {
		http.Error(w, "Could not add friend (might already be added)", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Friend added successfully!"})
}