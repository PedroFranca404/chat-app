package auth

import (
	"encoding/json"
	"net/http"

	"github.com/PedroFranca404/chat-app/repository"
	"golang.org/x/crypto/bcrypt"
)

func handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var creds Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	storedHash, err := repository.GetPasswordOfUsername(creds.Username)
	if err != nil {
		http.Error(w, "User not found or database error", http.StatusUnauthorized)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(creds.Password))
	if err != nil {
		http.Error(w, "Wrong password", http.StatusUnauthorized)
		return
	}

	w.Write([]byte("Login Successful!"))
}