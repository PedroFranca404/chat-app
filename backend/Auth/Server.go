package auth

import "net/http"

func StartServer() {
	http.HandleFunc("/register", handleRegister)
	http.HandleFunc("/login", handleLogin)

	http.ListenAndServe(":8080", nil)
}