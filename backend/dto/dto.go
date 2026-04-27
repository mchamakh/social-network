package dto

type RegisterInput struct {
	FirstName string `json:"first_name" validate:"required,min=2"`
	LastName  string `json:"last_name" validate:"required,min=2"`
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=6"`
	Birthday  string `json:"birthday" validate:"required"`

	NickName *string `json:"nickname,omitempty" validate:"omitempty,min=2"`
	Avatar   *string `json:"avatar,omitempty" validate:"omitempty"`
	AboutMe  *string `json:"about_me,omitempty" validate:"omitempty,max=200"`
}

type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}
