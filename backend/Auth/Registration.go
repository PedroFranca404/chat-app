package auth

import (
	"encoding/json"
	"net/http"
	"golang.org/x/crypto/bcrypt"
)

func handleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var creds Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(creds.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	// Mutex para prevenir race conditions.
	// LOCK -> WRITE -> UNLOCK
	dbLock.Lock()
	userDB[creds.Username] = string(hashedPassword)
	dbLock.Unlock()

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("User registered"))
}