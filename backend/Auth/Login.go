package auth

import (
	"encoding/json"
	"net/http"
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

	// Mutex para prevenir race conditions e data corruption.
	// LOCK -> READ -> UNLOCK
	dbLock.Lock()
	storedHash, exists := userDB[creds.Username]
	dbLock.Unlock()

	if !exists {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	// Compara a password recebida com o hash da DB
	err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(creds.Password))
	if err != nil {
		http.Error(w, "Wrong password", http.StatusUnauthorized)
		return
	}

	w.Write([]byte("Login Successful!"))
}