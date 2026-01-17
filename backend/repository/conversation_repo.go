package repository

import (
	"time"

	"github.com/PedroFranca404/chat-app/config"
	"github.com/PedroFranca404/chat-app/schemas"
	"github.com/google/uuid"
)

func CreateConversation(name string, isGroup bool, userIds []uuid.UUID) (*schemas.Conversations, error) {
	uniqueUsers := make(map[uuid.UUID]bool)
	var cleanUserIds []uuid.UUID

	for _, id := range userIds {
		if _, exists := uniqueUsers[id]; !exists {
			uniqueUsers[id] = true
			cleanUserIds = append(cleanUserIds, id)
		}
	}

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

	var participants []schemas.Participants

	for _, uid := range cleanUserIds {
		participants = append(participants, schemas.Participants{
			Id:             uuid.New(),
			ConversationId: conv.Id,
			UserId:         uid,
			Role:           "member",
			JoinedAt:       time.Now(),
		})
	}

	if len(participants) > 0 {
		if err := tx.Create(&participants).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	tx.Commit()
	return &conv, nil
}
