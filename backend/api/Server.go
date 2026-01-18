package api

import (
	"net/http"

	"github.com/PedroFranca404/chat-app/config"
)

const PORT = os.Getenv("PORT") || ":8080"

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
	http.HandleFunc("/send_message", func(w http.ResponseWriter, r *http.Request) {
		HandleSendMessage(hub, w, r)
	})
	http.HandleFunc("/get_messages", HandleGetMessages)
	http.HandleFunc("/create_conversation", HandleCreateConversation)
	http.HandleFunc("/get_conversations", HandleGetConversations)

	http.ListenAndServe(PORT, config.Cors(http.DefaultServeMux))
}
