package model

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	FirstName string  `gorm:"not null" validate:"required,min=2"`
	LastName  string  `gorm:"not null" validate:"required,min=2"`
	NickName  *string `gorm:"uniqueIndex" validate:"omitempty,min=2"`

	Birthday string `gorm:"not null" validate:"required"`

	Email    string `gorm:"uniqueIndex" validate:"required,email"`
	Password string `gorm:"not nul" validate:"required,min=6"`

	Avatar  *string `validate:"omitempty,url"`
	AboutMe *string `validate:"omitempty,max=200"`

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
