package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/PedroFranca404/chat-app/repository"
	"github.com/google/uuid"
)

type SendMessageRequest struct {
	ClientId       string `json:"client_id"`
	ConversationId string `json:"conversation_id"`
	Content        string `json:"content"`
}

type EditMessageRequest struct {
	ClientId  string `json:"client_id"`
	MessageId string `json:"message_id"`
	Content   string `json:"content"`
}

type DeleteMessageRequest struct {
	ClientId  string `json:"client_id"`
	MessageId string `json:"message_id"`
}

func HandleSendMessage(hub *Hub, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req SendMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Println("Error decoding body:", err)
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	fmt.Println("HandleSendMessage Request:", req)

	user, err := ValidateUser(req.ClientId)
	if err != nil {
		fmt.Println("ValidateUser Error:", err)
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	conversationUUID, err := uuid.Parse(req.ConversationId)
	if err != nil {
		fmt.Println("UUID Parse Error:", err)
		http.Error(w, "Invalid conversation_id", http.StatusBadRequest)
		return
	}

	msg, err := repository.AddMessage(user.Id, conversationUUID, req.Content)
	if err != nil {
		fmt.Println("AddMessage Error:", err)
		http.Error(w, "Failed to send message: "+err.Error(), http.StatusInternalServerError)
		return
	}

	msgBytes, _ := json.Marshal(msg)
	hub.broadcast <- msgBytes

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(msg)
}

func HandleGetMessages(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	conversationId := r.URL.Query().Get("conversation_id")
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	cookie, err := r.Cookie("client_id")
	if err != nil {
		http.Error(w, "Unauthorized: No session found", http.StatusUnauthorized)
		return
	}

	_, err = ValidateUser(cookie.Value)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	conversationUUID, err := uuid.Parse(conversationId)
	if err != nil {
		http.Error(w, "Invalid conversation_id", http.StatusBadRequest)
		return
	}

	limit := 20
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil {
			limit = l
		}
	}

	offset := 0
	if offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil {
			offset = o
		}
	}

	messages, err := repository.GetMessages(conversationUUID, limit, offset)
	if err != nil {
		http.Error(w, "Failed to retrieve messages: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func HandleEditMessage(hub *Hub, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req EditMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	user, err := ValidateUser(req.ClientId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	msgUUID, err := uuid.Parse(req.MessageId)
	if err != nil {
		http.Error(w, "Invalid message_id", http.StatusBadRequest)
		return
	}

	msg, err := repository.GetMessageById(msgUUID)
	if err != nil {
		http.Error(w, "Message not found", http.StatusNotFound)
		return
	}

	if msg.SenderId != user.Id {
		http.Error(w, "Unauthorized to edit this message", http.StatusForbidden)
		return
	}

	err = repository.EditMessage(msgUUID, req.Content)
	if err != nil {
		http.Error(w, "Failed to edit message: "+err.Error(), http.StatusInternalServerError)
		return
	}

	msg.Content = req.Content

	msgBytes, _ := json.Marshal(msg)
	hub.broadcast <- msgBytes

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(msg)
}

func HandleDeleteMessage(hub *Hub, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req DeleteMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	user, err := ValidateUser(req.ClientId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	msgUUID, err := uuid.Parse(req.MessageId)
	if err != nil {
		http.Error(w, "Invalid message_id", http.StatusBadRequest)
		return
	}

	msg, err := repository.GetMessageById(msgUUID)
	if err != nil {
		http.Error(w, "Message not found", http.StatusNotFound)
		return
	}

	if msg.SenderId != user.Id {
		http.Error(w, "Unauthorized to delete this message", http.StatusForbidden)
		return
	}

	err = repository.EraseMessage(msgUUID)
	if err != nil {
		http.Error(w, "Failed to delete message: "+err.Error(), http.StatusInternalServerError)
		return
	}

	msg.Content = "Message Erased"
	msg.Type = "deleted"

	msgBytes, _ := json.Marshal(msg)
	hub.broadcast <- msgBytes

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(msg)
}
