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

	if !isGroup && len(cleanUserIds) == 2 {
		var existingConv schemas.Conversations

		if err := config.DB.
			Joins("JOIN participants p1 ON p1.conversation_id = conversations.id").
			Joins("JOIN participants p2 ON p2.conversation_id = conversations.id").
			Where("p1.user_id = ? AND p2.user_id = ? AND conversations.is_group = ?", cleanUserIds[0], cleanUserIds[1], false).
			First(&existingConv).Error; err == nil {

			tx.Model(&schemas.Participants{}).
				Where("conversation_id = ? AND user_id IN ?", existingConv.Id, cleanUserIds).
				Update("hidden", false)

			tx.Commit()
			return &existingConv, nil
		}
	}

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

func GetConversations(userId uuid.UUID) ([]schemas.Conversations, error) {
	var conversations []schemas.Conversations

	err := config.DB.
		Joins("JOIN participants ON participants.conversation_id = conversations.id").
		Where("participants.user_id = ? AND participants.hidden = ?", userId, false).
		Preload("Participants.User").
		Find(&conversations).Error

	if err != nil {
		return nil, err
	}

	return conversations, nil
}
