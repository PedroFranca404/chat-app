package main

import (
	"fmt"
	"log"

	auth "github.com/PedroFranca404/chat-app/Auth"
	"github.com/PedroFranca404/chat-app/config"
)

func main() {
	config.Init()

	if config.CheckDBStatus() {
		fmt.Println("Database is UP")
	} else {
		log.Fatal("Database is DOWN")
	}

	hub := auth.NewHub()
	go hub.Run()

	fmt.Println("Starting Chat App Server...")
	auth.StartServer(hub)
}
