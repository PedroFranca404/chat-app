package main

import (
	"fmt"
	"log"

	"github.com/PedroFranca404/chat-app/config"
	"github.com/PedroFranca404/chat-app/repository"
	"github.com/google/uuid"
)

func main() {
	config.Init()

	if config.CheckDBStatus() {
		fmt.Println("Database is UP")
	} else {
		log.Fatal("Database is DOWN")
	}

	/* Exemplos de como usar os helpers */

	if false {
		user, err := repository.AddUser("Lixt Test 2", "encrypted password", "avatar.png")
		if err != nil {
			log.Println("Error adding user:", err)
		} else {
			fmt.Printf("User Added: %s (%s)\n", user.Name, user.Id)
		}
	}

	if true {
		user1, _ := repository.SearchUser("Lixt Test")
		user2, _ := repository.SearchUser("Lixt Test 2")

		if len(user1) > 0 && len(user2) > 0 {
			conv, err := repository.CreateConversation(
				"Private Chat",
				false,
				[]uuid.UUID{user1[0].Id, user2[0].Id},
			)

			if err != nil {
				log.Println("Error creating conversation:", err)
			} else {
				msg, err := repository.AddMessage(user1[0].Id, conv.Id, "Hello, this is a test message!")

				if err != nil {
					log.Println("Error adding message:", err)
				} else {
					fmt.Printf("Message Added: %s (ID: %s) to Conversation: %s\n", msg.Content, msg.Id, conv.Id)
				}
			}
		} else {
			log.Println("Users not found")
		}
	}

	println("Chat App Ready")
}