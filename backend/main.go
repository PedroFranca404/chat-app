package main

import (
	"github.com/PedroFranca404/chat-app/config"
	database "github.com/PedroFranca404/chat-app/schemas"
)

func main() {
	config.Init()
	println("Chat App Commit")

	user := database.Users{
		Name:      "Oe",
		AvatarUrl: "smape",
		Status:    "online",
	}

	config.DB.Create(&user)
}
