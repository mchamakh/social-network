package model

import (
	"time"

	"github.com/google/uuid"
)

const (
	NotifFollowRequest    = "follow_request"
	NotifGroupInvitation  = "group_invitation"
	NotifGroupJoinRequest = "group_join_request"
	NotifGroupEvent       = "group_event"
)

type Notification struct {
	ID          uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID      uuid.UUID  `gorm:"not null" json:"user_id"`
	Type        string     `gorm:"not null" json:"type"`
	ActorID     *uuid.UUID `json:"actor_id,omitempty"`
	ReferenceID *uuid.UUID `json:"reference_id,omitempty"`
	Content     string     `gorm:"not null" json:"content"`
	Read        bool       `gorm:"default:false" json:"read"`
	CreatedAt   time.Time  `json:"created_at"`
}

type NotificationRepository interface {
	Create(n *Notification) error
	GetByUser(userID uuid.UUID) ([]Notification, error)
	MarkRead(notifID, userID uuid.UUID) error
	MarkAllRead(userID uuid.UUID) error
	UnreadCount(userID uuid.UUID) (int64, error)
}
