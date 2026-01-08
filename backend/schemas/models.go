package schemas

import (
	"time"
	"github.com/google/uuid"
)

type Users struct {
	Id        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name      string    `gorm:"uniqueIndex;not null"`
	Password  string    `gorm:"not null"` // Already encrypted and hashed -> Authentication middleware will handle this
	AvatarUrl string
	Status    string
	CreatedAt time.Time
}

type Conversations struct {
	Id        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	IsGroup   bool
	Name      string
	CreatedAt time.Time
}

type Messages struct {
	Id             uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ConversationId uuid.UUID `gorm:"type:uuid;not null;index"`
	SenderId       uuid.UUID `gorm:"type:uuid;not null;index"`

	Content string `gorm:"type:text;not null"`
	Type    string `gorm:"type:varchar(20);not null"`

	CreatedAt time.Time

	Conversation Conversations `gorm:"foreignKey:ConversationId;references:Id;constraint:OnDelete:CASCADE"`
	Sender       Users         `gorm:"foreignKey:SenderId;references:Id;constraint:OnDelete:CASCADE"`
}

type Participants struct {
	ConversationId uuid.UUID `gorm:"type:uuid;not null;primaryKey;index"`
	UserId         uuid.UUID `gorm:"type:uuid;not null;primaryKey;index"`

	JoinedAt time.Time
	Role     string `gorm:"type:varchar(20);not null"`

	Conversation Conversations `gorm:"foreignKey:ConversationId;references:Id;constraint:OnDelete:CASCADE"`
	User         Users         `gorm:"foreignKey:UserId;references:Id;constraint:OnDelete:CASCADE"`
}