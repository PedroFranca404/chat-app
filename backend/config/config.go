package config

import (
	"log"
	"os"

	"github.com/PedroFranca404/chat-app/schemas"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init() {
	_ = godotenv.Load(".env")
	
	dsn := os.Getenv("DATABASE_URL")
	DB, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	DB.AutoMigrate(&schemas.Users{}, &schemas.FriendRequests{}, &schemas.Conversations{}, &schemas.Participants{}, &schemas.Messages{})
}

func CheckDBStatus() bool {
	if DB == nil {
		return false
	}
	db, err := DB.DB()
	if err != nil {
		return false
	}
	err = db.Ping()
	return err == nil
}
