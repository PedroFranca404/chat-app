package config

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/PedroFranca404/chat-app/schemas"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
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

func migrateDB(db *gorm.DB) {
	err := db.AutoMigrate(
		&schemas.Users{},
		&schemas.Conversations{},
		&schemas.Participants{},
		&schemas.Messages{},
	)

	if err != nil {
		log.Fatal("Error migrating database: ", err)
	}
}

func CheckDBStatus() bool {
	if DB == nil {
		return false
	}
	sqlDB, err := DB.DB()
	if err != nil {
		return false
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := sqlDB.PingContext(ctx); err != nil {
		return false
	}
	return true
}