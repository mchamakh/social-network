package model

import (
	"time"

	"github.com/google/uuid"
)

type ReactionType string

const (
	ReactionLike    ReactionType = "like"
	ReactionDislike ReactionType = "dislike"
)

type Reaction struct {
	ID           uuid.UUID    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID       uuid.UUID    `gorm:"type:uuid;not null;uniqueIndex:idx_user_post" json:"user_id"`
	PostID       uuid.UUID    `gorm:"type:uuid;not null;uniqueIndex:idx_user_post" json:"post_id"`
	ReactionType ReactionType `gorm:"type:varchar(10);not null" json:"reaction_type" validate:"required,oneof=like dislike"`

	CreatedAt time.Time `json:"created_at"`
}

type ReactionRepository interface {
	Upsert(reaction *Reaction) error
	Delete(userID uuid.UUID, postID uuid.UUID) error
	GetByPostID(postID uuid.UUID) ([]Reaction, error)
	GetByUserAndPost(userID uuid.UUID, postID uuid.UUID) (*Reaction, error)
}
