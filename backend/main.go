package main

import (
	"fmt"
	"log"

	"github.com/PedroFranca404/chat-app/Auth"
	"github.com/PedroFranca404/chat-app/config"
)

func main() {
	config.Init()

	if config.CheckDBStatus() {
		fmt.Println("Database is UP")
	} else {
		log.Fatal("Database is DOWN")
	}

	fmt.Println("Starting Chat App Server...")
	auth.StartServer()
}
