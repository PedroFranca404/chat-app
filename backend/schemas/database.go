package schemas

import (
	"time"

	"github.com/google/uuid"
)

type Friends struct {
	Id        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserId    uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_user_friend;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user_id"`
	FriendId  uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_user_friend;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"friend_id"`
	CreatedAt time.Time `json:"created_at"`
}

type FriendRequests struct {
	Id         uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	SenderId   uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_sender_receiver;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"sender_id"`
	ReceiverId uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_sender_receiver;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"receiver_id"`
	CreatedAt  time.Time `json:"created_at"`
}

type Users struct {
	Id        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name      string    `gorm:"unique;not null" json:"name"`
	Password  string    `gorm:"not null" json:"-"`
	AvatarUrl string    `json:"avatar_url"`
	Status    string    `json:"status"`
	ClientId  uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();not null;index" json:"client_id"`
	CreatedAt time.Time `json:"created_at"`
	Friends   []*Users  `gorm:"many2many:friends;joinForeignKey:UserId;joinReferences:FriendId" json:"friends,omitempty"`
}

type Conversations struct {
	Id        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name      string    `json:"name"`
	IsGroup   bool      `json:"is_group"`
	CreatedAt time.Time `json:"created_at"`
}

type Participants struct {
	Id             uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserId         uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_chat_participant;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user_id"`
	ConversationId uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_chat_participant;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"conversation_id"`
	Role           string    `json:"role"`
	JoinedAt       time.Time `json:"joined_at"`
}

type Messages struct {
	Id             uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	SenderId       uuid.UUID `gorm:"type:uuid;not null" json:"sender_id"`
	ConversationId uuid.UUID `gorm:"type:uuid;not null;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"conversation_id"`
	Content        string    `json:"content"`
	Type           string    `json:"type"`
	CreatedAt      time.Time `json:"created_at"`
}
