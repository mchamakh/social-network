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

type FollowRepository interface {
	Create(follow *Follow) error
	Get(followerID, followingID uuid.UUID) (*Follow, error)
	UpdateStatus(id uuid.UUID, status FollowStatus) error
	Delete(id uuid.UUID) error
	GetFollowers(userID uuid.UUID) ([]User, error)
	GetFollowing(userID uuid.UUID) ([]User, error)
	GetPendingRequests(userID uuid.UUID) ([]Follow, error)
}
