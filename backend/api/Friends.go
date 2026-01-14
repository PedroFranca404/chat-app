package auth

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
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

func HandleSendFriendRequest(w http.ResponseWriter, r *http.Request) {
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
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Body", http.StatusBadRequest)
		return
	}

	var targetUser schemas.Users
	if err := config.DB.Where("name = ?", req.Username).First(&targetUser).Error; err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	if currentUser.Id == targetUser.Id {
		http.Error(w, "You can't send a request to yourself", http.StatusBadRequest)
		return
	}

	var existingFriend schemas.Friends
	err = config.DB.Where(
		"(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
		currentUser.Id, targetUser.Id,
		targetUser.Id, currentUser.Id,
	).First(&existingFriend).Error

	if err == nil {
		http.Error(w, "Already friends with this user", http.StatusBadRequest)
		return
	}

	var existingRequest schemas.FriendRequests
	err = config.DB.Where(
		"(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
		currentUser.Id, targetUser.Id,
		targetUser.Id, currentUser.Id,
	).First(&existingRequest).Error

	if err == nil {
		http.Error(w, "Friend request already pending", http.StatusBadRequest)
		return
	}

	friendRequest := schemas.FriendRequests{
		SenderId:   currentUser.Id,
		ReceiverId: targetUser.Id,
	}

	if err := config.DB.Create(&friendRequest).Error; err != nil {
		http.Error(w, "Could not send friend request", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Friend request sent!"})
}

func HandleGetFriendRequests(w http.ResponseWriter, r *http.Request) {
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

	var requests []schemas.FriendRequests
	if err := config.DB.Where("receiver_id = ?", currentUser.Id).Find(&requests).Error; err != nil {
		http.Error(w, "Error fetching friend requests", http.StatusInternalServerError)
		return
	}

	type RequestResponse struct {
		Id         string `json:"id"`
		SenderId   string `json:"sender_id"`
		SenderName string `json:"sender_name"`
	}

	var response []RequestResponse
	for _, req := range requests {
		var sender schemas.Users
		if err := config.DB.Where("id = ?", req.SenderId).First(&sender).Error; err != nil {
			continue
		}
		response = append(response, RequestResponse{
			Id:         req.Id.String(),
			SenderId:   req.SenderId.String(),
			SenderName: sender.Name,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func HandleAcceptFriendRequest(w http.ResponseWriter, r *http.Request) {
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
		RequestId string `json:"request_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Body", http.StatusBadRequest)
		return
	}

	requestId, err := uuid.Parse(req.RequestId)
	if err != nil {
		http.Error(w, "Invalid request ID", http.StatusBadRequest)
		return
	}

	var friendRequest schemas.FriendRequests
	if err := config.DB.Where("id = ? AND receiver_id = ?", requestId, currentUser.Id).First(&friendRequest).Error; err != nil {
		http.Error(w, "Friend request not found", http.StatusNotFound)
		return
	}

	var sender schemas.Users
	if err := config.DB.Where("id = ?", friendRequest.SenderId).First(&sender).Error; err != nil {
		http.Error(w, "Sender not found", http.StatusNotFound)
		return
	}

	tx := config.DB.Begin()

	if err := tx.Model(&currentUser).Association("Friends").Append(&sender); err != nil {
		tx.Rollback()
		http.Error(w, "Could not accept friend request", http.StatusInternalServerError)
		return
	}

	if err := tx.Model(&sender).Association("Friends").Append(&currentUser); err != nil {
		tx.Rollback()
		http.Error(w, "Could not accept friend request", http.StatusInternalServerError)
		return
	}

	if err := tx.Delete(&friendRequest).Error; err != nil {
		tx.Rollback()
		http.Error(w, "Could not delete friend request", http.StatusInternalServerError)
		return
	}

	tx.Commit()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Friend request accepted!"})
}

func HandleRejectFriendRequest(w http.ResponseWriter, r *http.Request) {
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
		RequestId string `json:"request_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Body", http.StatusBadRequest)
		return
	}

	requestId, err := uuid.Parse(req.RequestId)
	if err != nil {
		http.Error(w, "Invalid request ID", http.StatusBadRequest)
		return
	}

	result := config.DB.Where("id = ? AND receiver_id = ?", requestId, currentUser.Id).Delete(&schemas.FriendRequests{})
	if result.Error != nil {
		http.Error(w, "Could not reject friend request", http.StatusInternalServerError)
		return
	}

	if result.RowsAffected == 0 {
		http.Error(w, "Friend request not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Friend request rejected"})
}