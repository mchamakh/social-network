package model

import (
	"time"

	"github.com/google/uuid"
)

type FollowStatus string

const (
	Pending  FollowStatus = "pending"
	Accepted FollowStatus = "accepted"
)

type Follow struct {
	ID          uuid.UUID    `gorm:"type:uuid;primaryKey"`
	FollowerID  uuid.UUID    `gorm:"type:uuid;not null;index:idx_follow_unique,unique"`
	FollowingID uuid.UUID    `gorm:"type:uuid;not null;index:idx_follow_unique,unique"`
	Status      FollowStatus `gorm:"type:varchar(20);not null"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type FollowRequestPreview struct {
	FollowID   uuid.UUID `json:"follow_id"`
	FollowerID uuid.UUID `json:"follower_id"`
	FirstName  string    `json:"first_name"`
	LastName   string    `json:"last_name"`
	NickName   *string   `json:"nickname,omitempty"`
	Avatar     *string   `json:"avatar,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}

type FollowRepository interface {
	Create(follow *Follow) error
	Get(followerID, followingID uuid.UUID) (*Follow, error)
	GetByID(id uuid.UUID) (*Follow, error)
	UpdateStatus(id uuid.UUID, status FollowStatus) error
	Delete(id uuid.UUID) error
	GetFollowers(userID uuid.UUID) ([]User, error)
	GetFollowing(userID uuid.UUID) ([]User, error)
	GetPendingRequests(userID uuid.UUID) ([]FollowRequestPreview, error)
}
