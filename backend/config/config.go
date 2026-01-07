package config

import (
	"log"
	"os"

	database "github.com/PedroFranca404/chat-app/schemas"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error reading .env file:  ", err)
	}
	DB = connectDB()
	migrateDB(DB)
}

func connectDB() *gorm.DB {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL not set in .env")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Error connecting to database: ", err)
	}
	return db
}

// Just use when migrating DB
func migrateDB(db *gorm.DB) {
	err := db.AutoMigrate(
		&database.Users{},
		&database.Conversations{},
		&database.Participants{},
		&database.Messages{},
	)

	if err != nil {
		log.Fatal("Error migrating database: ", err)
	}
}
