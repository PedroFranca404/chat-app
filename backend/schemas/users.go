package schemas

import (
	"time"

	"github.com/google/uuid"
)

type Users struct {
	Id        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name      string    `gorm:"unique;not null"`
	Password  string    `gorm:"not null"`
	AvatarUrl string
	Status    string
	CreatedAt time.Time
}

type Conversations struct {
	Id        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name      string
	IsGroup   bool
	CreatedAt time.Time
}

type Participants struct {
	Id             uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserId         uuid.UUID
	ConversationId uuid.UUID
	Role           string
	JoinedAt       time.Time
}

type Messages struct {
	Id             uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	SenderId       uuid.UUID
	ConversationId uuid.UUID
	Content        string
	Type           string
	CreatedAt      time.Time
}
