package model

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`

	FirstName string  `gorm:"not null" json:"first_name" validate:"required,min=2"`
	LastName  string  `gorm:"not null" json:"last_name" validate:"required,min=2"`
	NickName  *string `gorm:"uniqueIndex" json:"nickname,omitempty" validate:"omitempty,min=2"`

	Birthday string `gorm:"not null" json:"birthday" validate:"required"`

	Email    string `gorm:"uniqueIndex" json:"email" validate:"required,email"`
	Password string `gorm:"not null" json:"-" validate:"required,min=6"`

	Avatar  *string `json:"avatar,omitempty" validate:"omitempty,url"`
	AboutMe *string `json:"about_me,omitempty" validate:"omitempty,max=200"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UserRepository interface {
	Create(user *User) error
	GetAll() ([]User, error)
	GetByEmail(email string) (*User, error)
	GetByID(id uuid.UUID) (*User, error)
	Delete(id uuid.UUID) error
}
