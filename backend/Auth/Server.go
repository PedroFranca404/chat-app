package auth

import "net/http"

func StartServer() {
	http.HandleFunc("/register", handleRegister)
	http.HandleFunc("/login", handleLogin)
	http.HandleFunc("/send_message", handleSendMessage)
	http.HandleFunc("/get_messages", handleGetMessages)

	http.ListenAndServe(":8080", nil)
}