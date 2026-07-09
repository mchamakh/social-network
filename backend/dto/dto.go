package dto

import (
	"strings"

	"github.com/go-playground/validator/v10"
)

func NotBlank(fl validator.FieldLevel) bool {
	field := fl.Field().String()
	return strings.TrimSpace(field) != ""
}

type RegisterInput struct {
	FirstName string `json:"first_name" validate:"required,min=2"`
	LastName  string `json:"last_name" validate:"required,min=2"`
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=6"`
	Birthday  string `json:"birthday" validate:"required"`

	NickName *string `json:"nickname,omitempty" validate:"omitempty,min=2,notblank"`
	Avatar   *string `json:"avatar,omitempty" validate:"omitempty"`
	AboutMe  *string `json:"about_me,omitempty" validate:"omitempty,max=200"`
}

type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type UpdateProfileInput struct {
	FirstName *string `json:"first_name,omitempty" validate:"omitempty,min=2"`
	LastName  *string `json:"last_name,omitempty" validate:"omitempty,min=2"`
	NickName  *string `json:"nickname,omitempty" validate:"omitempty,min=2,notblank"`
	Birthday  *string `json:"birthday,omitempty" validate:"omitempty"`
	Avatar    *string `json:"avatar,omitempty" validate:"omitempty"`
	Banner    *string `json:"banner,omitempty" validate:"omitempty"`
	AboutMe   *string `json:"about_me,omitempty" validate:"omitempty,max=200"`
	IsPrivate *bool   `json:"is_private,omitempty"`
}
