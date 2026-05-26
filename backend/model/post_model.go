package model

import (
	"time"

	"github.com/google/uuid"
)

type Post struct {
	ID       uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	AuthorID uuid.UUID `gorm:"type:uuid;not null" json:"author_id"`

	Content  string  `gorm:"not null" json:"content" validate:"required,min=1"`
	ImageURL *string `json:"image_url,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type PostRepository interface {
	Create(post *Post) error
	GetAll() ([]Post, error)
	GetByID(id uuid.UUID) (*Post, error)
	GetByAuthorID(authorID uuid.UUID) ([]Post, error)
	Delete(id uuid.UUID) error
}
