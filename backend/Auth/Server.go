package auth

import (
	"net/http"

	"github.com/PedroFranca404/chat-app/config"
)

func StartServer(hub *Hub) {
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ServeWs(hub, w, r)
	})
	http.HandleFunc("/register", handleRegister)
	http.HandleFunc("/login", handleLogin)
	http.HandleFunc("/logout", handleLogout)
	http.HandleFunc("/send_message", handleSendMessage)
	http.HandleFunc("/get_messages", handleGetMessages)

	http.ListenAndServe(":8080", config.Cors(http.DefaultServeMux))
}
