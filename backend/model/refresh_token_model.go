package model

import (
	"time"

	"github.com/google/uuid"
)

type RefreshToken struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID    uuid.UUID `gorm:"type:uuid;not null"`
	Token     string    `gorm:"not null;uniqueIndex"`
	ExpiresAt time.Time `gorm:"not null"`
	CreatedAt time.Time
}

type RefreshTokenRepository interface {
	Create(userID uuid.UUID, token string) error
	Find(token string) (*RefreshToken, error)
	Delete(token string) error
	DeleteByID(userID uuid.UUID) error
}
