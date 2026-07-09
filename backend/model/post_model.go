package model

import (
	"time"

	"github.com/google/uuid"
)

type PostPrivacy string

const (
	PostPublic       PostPrivacy = "public"
	PostAlmostPrivate PostPrivacy = "almost_private"
	PostPrivate      PostPrivacy = "private"
)

type Post struct {
	ID        uuid.UUID   `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	AuthorID  uuid.UUID   `gorm:"not null" json:"author_id"`
	Content   string      `gorm:"not null" json:"content"`
	Image     *string     `json:"image,omitempty"`
	Privacy   PostPrivacy `gorm:"not null;default:'public'" json:"privacy"`
	CreatedAt time.Time   `json:"created_at"`
	UpdatedAt time.Time   `json:"updated_at"`
}

type PostPrivacyUser struct {
	PostID uuid.UUID `gorm:"primaryKey" json:"post_id"`
	UserID uuid.UUID `gorm:"primaryKey" json:"user_id"`
}

type Like struct {
	PostID    uuid.UUID `gorm:"primaryKey" json:"post_id"`
	UserID    uuid.UUID `gorm:"primaryKey" json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
}

type Comment struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	PostID    uuid.UUID `gorm:"not null" json:"post_id"`
	AuthorID  uuid.UUID `gorm:"not null" json:"author_id"`
	Content   string    `gorm:"not null" json:"content"`
	Image     *string   `json:"image,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

// PostResponse is the enriched post returned to clients.
type PostResponse struct {
	ID            uuid.UUID   `json:"id"`
	Content       string      `json:"content"`
	Image         *string     `json:"image,omitempty"`
	Privacy       PostPrivacy `json:"privacy"`
	CreatedAt     time.Time   `json:"created_at"`
	AuthorID      uuid.UUID   `json:"author_id"`
	AuthorName    string      `json:"author_name"`
	AuthorHandle  string      `json:"author_handle"`
	AuthorAvatar  *string     `json:"author_avatar,omitempty"`
	LikesCount    int64       `json:"likes_count"`
	CommentsCount int64       `json:"comments_count"`
	Liked         bool        `json:"liked"`
}

// CommentResponse is the enriched comment returned to clients.
type CommentResponse struct {
	ID           uuid.UUID `json:"id"`
	PostID       uuid.UUID `json:"post_id"`
	Content      string    `json:"content"`
	Image        *string   `json:"image,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	AuthorID     uuid.UUID `json:"author_id"`
	AuthorName   string    `json:"author_name"`
	AuthorHandle string    `json:"author_handle"`
	AuthorAvatar *string   `json:"author_avatar,omitempty"`
}

type PostRepository interface {
	Create(post *Post) error
	GetByID(id uuid.UUID) (*Post, error)
	GetFeed(userID uuid.UUID) ([]PostResponse, error)
	GetByAuthor(authorID, viewerID uuid.UUID) ([]PostResponse, error)
	Delete(id uuid.UUID) error
	AddPrivacyUser(postID, userID uuid.UUID) error
	ToggleLike(postID, userID uuid.UUID) (bool, error)
	GetComments(postID uuid.UUID) ([]CommentResponse, error)
	AddComment(c *Comment) error
}
