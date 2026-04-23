package model

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FirstName string
	LastName  string
	NickName  *string `gorm:"uniqueIndex"`
	Birthday  string
	Email     string `gorm:"uniqueIndex"`
	Password  string
	Avatar    *string
	AboutMe   *string
	CreatedAt time.Time
	UpdateAt  time.Time
}

type UserRepository interface {
	Create(user *User) error
	GetAll() ([]User, error)
	GetByEmail(email string) (*User, error)
	GetByID(id uuid.UUID) (*User, error)
	Delete(id uuid.UUID) error
}
