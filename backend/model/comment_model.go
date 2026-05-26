package model

import (
	"time"

	"github.com/google/uuid"
)

type Comment struct {
	ID       uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	PostID   uuid.UUID `gorm:"type:uuid;not null" json:"post_id"`
	AuthorID uuid.UUID `gorm:"type:uuid;not null" json:"author_id"`

	Content string `gorm:"not null" json:"content" validate:"required,min=1"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CommentRepository interface {
	Create(comment *Comment) error
	GetByPostID(postID uuid.UUID) ([]Comment, error)
	GetByID(id uuid.UUID) (*Comment, error)
	Delete(id uuid.UUID) error
}
