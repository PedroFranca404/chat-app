package main

import (
	"fmt"
	auth "github.com/PedroFranca404/chat-app/Auth"
)

func main() {
	fmt.Println("Chat App Init")
	go auth.StartServer()
	fmt.Println("Server running on :8080")

	select {}
}