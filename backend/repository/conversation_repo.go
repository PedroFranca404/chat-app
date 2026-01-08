package repository

import (
	"time"

	"github.com/PedroFranca404/chat-app/config"
	"github.com/PedroFranca404/chat-app/schemas"
	"github.com/google/uuid"
)

func CreateConversation(name string, isGroup bool, userIds []uuid.UUID) (*schemas.Conversations, error) {
	tx := config.DB.Begin()

	conv := schemas.Conversations{
		Name:      name,
		IsGroup:   isGroup,
		CreatedAt: time.Now(),
	}

	if err := tx.Create(&conv).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	for _, uid := range userIds {
		participant := schemas.Participants{
			ConversationId: conv.Id,
			UserId:         uid,
			Role:           "member",
			JoinedAt:       time.Now(),
		}
		if err := tx.Create(&participant).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	tx.Commit()
	return &conv, nil
}