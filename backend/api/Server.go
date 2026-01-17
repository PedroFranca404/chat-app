package api

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
	http.HandleFunc("/send_friend_request", HandleSendFriendRequest)
	http.HandleFunc("/get_friend_requests", HandleGetFriendRequests)
	http.HandleFunc("/accept_friend_request", HandleAcceptFriendRequest)
	http.HandleFunc("/reject_friend_request", HandleRejectFriendRequest)
	http.HandleFunc("/send_message", HandleSendMessage)
	http.HandleFunc("/get_messages", HandleGetMessages)
	http.HandleFunc("/create_conversation", HandleCreateConversation)

	http.ListenAndServe(":8080", config.Cors(http.DefaultServeMux))
}
