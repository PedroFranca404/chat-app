package repository

import (
	"time"

	"github.com/PedroFranca404/chat-app/config"
	"github.com/PedroFranca404/chat-app/schemas"
	"github.com/PedroFranca404/chat-app/utils"
	"github.com/google/uuid"
)

func AddUser(name, passwordHash, avatar string) (*schemas.Users, error) {
	if err := utils.ValidateInput(name, 50); err != nil {
		return nil, err
	}

	if err := utils.ValidateInput(passwordHash, 255); err != nil {
		return nil, err
	}

	user := schemas.Users{
		Name:      name,
		Password:  passwordHash,
		AvatarUrl: avatar,
		Status:    "offline",
		CreatedAt: time.Now(),
	}

	result := config.DB.Create(&user)
	return &user, result.Error
}

func RemoveUser(userId uuid.UUID) error {
	result := config.DB.Delete(&schemas.Users{}, userId)
	return result.Error
}

func SearchUser(query string) ([]schemas.Users, error) {
	var users []schemas.Users
	// GORM handles SQL injection with parameterized queries. Just need to use '?'
	result := config.DB.Where("name ILIKE ?", "%"+query+"%").Find(&users)
	return users, result.Error
}

func GetUsernameFromUUID(id uuid.UUID) (string, error) {
	var user schemas.Users
	result := config.DB.Select("name").First(&user, id)
	if result.Error != nil {
		return "", result.Error
	}
	return user.Name, nil
}

func ChangePassword(id uuid.UUID, newPasswordHash string) error {
	if err := utils.ValidateInput(newPasswordHash, 255); err != nil {
		return err
	}
	result := config.DB.Model(&schemas.Users{}).Where("id = ?", id).Update("password", newPasswordHash)
	return result.Error
}

func ChangeAvatar(id uuid.UUID, newAvatarUrl string) error {
	result := config.DB.Model(&schemas.Users{}).Where("id = ?", id).Update("avatar_url", newAvatarUrl)
	return result.Error
}

func GetPasswordOfUsername(username string) (string, error) {
	var user schemas.Users
	result := config.DB.Select("password").Where("name = ?", username).First(&user)
	if result.Error != nil {
		return "", result.Error
	}
	return user.Password, nil
}