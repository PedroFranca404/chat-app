package api

import (
	"net/http"
	"os"

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
	http.HandleFunc("/update_user", HandleUpdateUser)
	http.HandleFunc("/send_message", func(w http.ResponseWriter, r *http.Request) {
		HandleSendMessage(hub, w, r)
	})
	http.HandleFunc("/edit_message", func(w http.ResponseWriter, r *http.Request) {
		HandleEditMessage(hub, w, r)
	})
	http.HandleFunc("/delete_message", func(w http.ResponseWriter, r *http.Request) {
		HandleDeleteMessage(hub, w, r)
	})
	http.HandleFunc("/get_messages", HandleGetMessages)
	http.HandleFunc("/create_conversation", HandleCreateConversation)
	http.HandleFunc("/get_conversations", HandleGetConversations)
	http.HandleFunc("/hide_conversation", HandleHideConversation)
	http.HandleFunc("/update_conversation", HandleUpdateConversation)
	http.HandleFunc("/leave_conversation", func(w http.ResponseWriter, r *http.Request) {
		HandleLeaveConversation(hub, w, r)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := http.ListenAndServe(":"+port, config.Cors(http.DefaultServeMux)); err != nil {
		panic(err)
	}
}
