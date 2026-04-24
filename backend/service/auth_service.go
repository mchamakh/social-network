package service

import (
	"api/model"
	"api/pkg"
	"fmt"
)

type AuthService interface {
	Register(input RegisterInput) error
	Login(input LoginInput) (string, string, error)
	Refresh(refreshToken string) (string, error)
	Logout(refreshToken string) error
}

type authService struct {
	userService UserService
	refreshRepo model.RefreshTokenRepository
}

func NewAuthService(userService UserService, refreshRepo model.RefreshTokenRepository) AuthService {
	return &authService{
		userService: userService,
		refreshRepo: refreshRepo,
	}
}

type RegisterInput struct {
	FirstName string `json:"first_name" validate:"required,min=2"`
	LastName  string `json:"last_name" validate:"required,min=2"`
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=6"`
	Birthday  string `json:"birthday" validate:"required"`

	NickName *string `json:"nickname,omitempty" validate:"omitempty,min=2"`
	Avatar   *string `json:"avatar,omitempty" validate:"omitempty,url"`
	AboutMe  *string `json:"about_me,omitempty" validate:"omitempty,max=200"`
}

type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

func (s *authService) Register(input RegisterInput) error {
	hashedPassword, err := pkg.HashPassword(input.Password)
	if err != nil {
		return err
	}
	user := model.User{
		FirstName: input.FirstName,
		LastName:  input.LastName,
		NickName:  input.NickName,
		Email:     input.Email,
		Password:  hashedPassword,
		Birthday:  input.Birthday,
		Avatar:    input.Avatar,
		AboutMe:   input.AboutMe,
	}
	return s.userService.Create(&user)
}

func (s *authService) Login(input LoginInput) (string, string, error) {
	user, err := s.userService.GetByEmail(input.Email)
	if err != nil {
		return "", "", fmt.Errorf("invalid credentials")
	}

	if err := pkg.ComparePassword(input.Password, user.Password); err != nil {
		return "", "", fmt.Errorf("invalid credentials")
	}

	accessToken, err := pkg.GenerateAcessToken(user.ID.String())
	if err != nil {
		return "", "", err
	}

	refreshToken, err := pkg.GenerateRefreshToken(user.ID.String())
	if err != nil {
		return "", "", err
	}

	err = s.refreshRepo.Create(user.ID, refreshToken)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func (s *authService) Refresh(token string) (string, error) {
	rt, err := s.refreshRepo.Find(token)
	if err != nil {
		return "", fmt.Errorf("invalid refresh token")
	}

	return pkg.GenerateAcessToken(rt.UserID.String())
}

func (s *authService) Logout(token string) error {
	return s.refreshRepo.Delete(token)
}
