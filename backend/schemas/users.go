package schemas

import (
	"time"

	"github.com/google/uuid"
)

type Friends struct {
	Id        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserId    uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_user_friend;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	FriendId  uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_user_friend;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	CreatedAt time.Time
}

type FriendRequests struct {
	Id         uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	SenderId   uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_sender_receiver;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	ReceiverId uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_sender_receiver;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	CreatedAt  time.Time
}

type Users struct {
	Id        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name      string    `gorm:"unique;not null"`
	Password  string    `gorm:"not null"`
	AvatarUrl string
	Status    string
	ClientId  uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();not null;index"`
	CreatedAt time.Time
	Friends   []*Users  `gorm:"many2many:friends;joinForeignKey:UserId;joinReferences:FriendId"`
}

type Conversations struct {
	Id        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name      string
	IsGroup   bool
	CreatedAt time.Time
}

type Participants struct {
	Id             uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserId         uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_chat_participant;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	ConversationId uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_chat_participant;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Role           string
	JoinedAt       time.Time
}

type Messages struct {
	Id             uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	SenderId       uuid.UUID `gorm:"type:uuid;not null"`
	ConversationId uuid.UUID `gorm:"type:uuid;not null;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Content        string
	Type           string
	CreatedAt      time.Time
}