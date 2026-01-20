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

func AddSystemMessage(senderId, conversationId uuid.UUID, content string) (*schemas.Messages, error) {
	if err := utils.ValidateInput(content, 2000); err != nil {
		return nil, err
	}

	msg := schemas.Messages{
		SenderId:       senderId,
		ConversationId: conversationId,
		Content:        content,
		Type:           "system",
		CreatedAt:      time.Now(),
	}

	result := config.DB.Create(&msg)
	return &msg, result.Error
}

func EraseMessage(msgId uuid.UUID) error {
	result := config.DB.Model(&schemas.Messages{}).Where("id = ?", msgId).Updates(map[string]interface{}{
		"content": "Message Erased",
		"type":    "deleted",
	})
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

func GetMessages(conversationId uuid.UUID, limit, offset int) ([]schemas.Messages, error) {
	var messages []schemas.Messages
	result := config.DB.Where("conversation_id = ?", conversationId).
		Order("created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&messages)
	return messages, result.Error
}

func GetMessageById(msgId uuid.UUID) (*schemas.Messages, error) {
	var msg schemas.Messages
	result := config.DB.First(&msg, "id = ?", msgId)
	return &msg, result.Error
}