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
