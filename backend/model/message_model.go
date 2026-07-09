package model

import (
	"time"

	"github.com/google/uuid"
)

type PrivateMessage struct {
	ID         uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	SenderID   uuid.UUID `gorm:"not null" json:"sender_id"`
	ReceiverID uuid.UUID `gorm:"not null" json:"receiver_id"`
	Content    string    `gorm:"not null" json:"content"`
	Image      *string   `json:"image,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}

type GroupMessage struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	GroupID   uuid.UUID `gorm:"not null" json:"group_id"`
	AuthorID  uuid.UUID `gorm:"not null" json:"author_id"`
	Content   string    `gorm:"not null" json:"content"`
	Image     *string   `json:"image,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type ConversationPreview struct {
	OtherUserID   uuid.UUID `json:"other_user_id"`
	OtherName     string    `json:"other_name"`
	OtherHandle   string    `json:"other_handle"`
	OtherAvatar   *string   `json:"other_avatar,omitempty"`
	LastMessage   string    `json:"last_message"`
	LastMessageAt time.Time `json:"last_message_at"`
	Unread        int64     `json:"unread"`
}

type GroupMessageResponse struct {
	ID           uuid.UUID `json:"id"`
	GroupID      uuid.UUID `json:"group_id"`
	Content      string    `json:"content"`
	Image        *string   `json:"image,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	AuthorID     uuid.UUID `json:"author_id"`
	AuthorName   string    `json:"author_name"`
	AuthorHandle string    `json:"author_handle"`
	AuthorAvatar *string   `json:"author_avatar,omitempty"`
}

type MessageRepository interface {
	SavePrivate(msg *PrivateMessage) error
	GetPrivateHistory(userID, otherID uuid.UUID, limit int) ([]PrivateMessage, error)
	GetConversations(userID uuid.UUID) ([]ConversationPreview, error)

	SaveGroup(msg *GroupMessage) error
	GetGroupHistory(groupID uuid.UUID, limit int) ([]GroupMessageResponse, error)
}
