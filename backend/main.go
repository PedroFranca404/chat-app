package main

import (
	"fmt"
	"log"

	api "github.com/PedroFranca404/chat-app/api"
	"github.com/PedroFranca404/chat-app/config"
)

func main() {
	config.Init()

	if config.CheckDBStatus() {
		fmt.Println("Database is UP")
	} else {
		log.Fatal("Database is DOWN")
	}

	hub := api.NewHub()
	go hub.Run()

	fmt.Println("Starting Chat App Server...")
	api.StartServer(hub)
}
