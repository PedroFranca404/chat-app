package api

import (
	"encoding/json"
	"net/http"

	"github.com/PedroFranca404/chat-app/config"
	"github.com/PedroFranca404/chat-app/schemas"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var cookieValue string
	cookie, err := r.Cookie("client_id")
	if err == nil {
		cookieValue = cookie.Value
	}

	var creds Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	var user schemas.Users
	if cookieValue != "" {
		if err := config.DB.Where("client_id = ?", cookieValue).First(&user).Error; err == nil {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]any{
				"message":    "Login Successful!",
				"client_id":  user.ClientId,
				"id":         user.Id,
				"name":       user.Name,
				"status":     user.Status,
				"avatar_url": user.AvatarUrl,
			})
			return
		}
	}

	if creds.Username == "" || creds.Password == "" {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	if err := config.DB.Where("name = ?", creds.Username).First(&user).Error; err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(creds.Password))
	if err != nil {
		http.Error(w, "Wrong password", http.StatusUnauthorized)
		return
	}

	if user.ClientId != uuid.Nil {
		SessionCache.Delete(user.ClientId.String())
	}

	newClientId := uuid.New()

	result := config.DB.Model(&schemas.Users{}).
		Where("id = ?", user.Id).
		Update("client_id", newClientId)

	if result.Error != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	user.ClientId = newClientId
	SessionCache.Set(newClientId.String(), &user)

	http.SetCookie(w, &http.Cookie{
		Name:     "client_id",
		Value:    newClientId.String(),
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
		Secure:   true,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message":   "Login Successful!",
		"client_id": newClientId.String(),
	})
}
