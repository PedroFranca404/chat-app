package repository

import (
	"time"

	"github.com/PedroFranca404/chat-app/config"
	"github.com/PedroFranca404/chat-app/schemas"
	"github.com/PedroFranca404/chat-app/utils"
	"github.com/google/uuid"
)

func AddMessage(senderId, conversationId uuid.UUID, content string) (*schemas.Messages, error) {
	if err := utils.ValidateInput(content, 2000); err != nil {
		return nil, err
	}

	msg := schemas.Messages{
		SenderId:       senderId,
		ConversationId: conversationId,
		Content:        content,
		Type:           "text",
		CreatedAt:      time.Now(),
	}

	result := config.DB.Create(&msg)
	return &msg, result.Error
}

func RemoveMessage(msgId uuid.UUID) error {
	result := config.DB.Delete(&schemas.Messages{}, msgId)
	return result.Error
}

func EditMessage(msgId uuid.UUID, newContent string) error {
	if err := utils.ValidateInput(newContent, 2000); err != nil {
		return err
	}
	result := config.DB.Model(&schemas.Messages{}).Where("id = ?", msgId).Update("content", newContent)
	return result.Error
}

func GetDaysUserSentMessage(userId uuid.UUID) ([]time.Time, error) {
	var dates []time.Time

	err := config.DB.Model(&schemas.Messages{}).
		Distinct("DATE(created_at)").
		Where("sender_id = ?", userId).
		Pluck("DATE(created_at)", &dates).Error

	return dates, err
}