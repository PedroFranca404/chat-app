package auth

import (
	"net/http"

	"github.com/PedroFranca404/chat-app/config"
)

func StartServer(hub *Hub) {
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ServeWs(hub, w, r)
	})
	http.HandleFunc("/register", HandleRegister)
	http.HandleFunc("/login", HandleLogin)
	http.HandleFunc("/logout", HandleLogout)
	http.HandleFunc("/get_friends", HandleGetFriends)
	http.HandleFunc("/add_friend", HandleAddFriend)
	http.HandleFunc("/send_message", HandleSendMessage)
	http.HandleFunc("/get_messages", HandleGetMessages)

	http.ListenAndServe(":8080", config.Cors(http.DefaultServeMux))
}