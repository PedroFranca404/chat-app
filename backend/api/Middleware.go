package api

import (
	"errors"

	"github.com/PedroFranca404/chat-app/config"
	"github.com/PedroFranca404/chat-app/schemas"
)

func ValidateUser(clientId string) (*schemas.Users, error) {
	if clientId == "" {
		return nil, errors.New("client_id is required")
	}

	var user schemas.Users
	result := config.DB.Where("client_id = ?", clientId).First(&user)
	if result.Error != nil {
		return nil, errors.New("invalid client_id")
	}

	return &user, nil
}
