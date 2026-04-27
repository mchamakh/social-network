package service

import (
	"api/dto"
	"api/model"
	"api/pkg"
	"fmt"
)

type AuthService interface {
	Register(input dto.RegisterInput) error
	Login(input dto.LoginInput) (string, string, error)
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

func (s *authService) Register(input dto.RegisterInput) error {
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

func (s *authService) Login(input dto.LoginInput) (string, string, error) {
	user, err := s.userService.GetByEmail(input.Email)
	if err != nil {
		return "", "", fmt.Errorf("invalid credentials")
	}

	if err := pkg.ComparePassword(input.Password, user.Password); err != nil {
		return "", "", fmt.Errorf("invalid credentials")
	}

	if err := s.refreshRepo.DeleteByID(user.ID); err != nil {
		return "", "", fmt.Errorf("failed to delete old refresh token %v\n", err)
	}

	accessToken, err := pkg.GenerateAcessToken(user.ID.String())
	if err != nil {
		return "", "", err
	}

	refreshToken, err := pkg.GenerateRefreshToken(user.ID.String())
	if err != nil {
		return "", "", err
	}
	hashRefreshToken := pkg.HashToken(refreshToken)

	err = s.refreshRepo.Create(user.ID, hashRefreshToken)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func (s *authService) Refresh(refreshToken string) (string, error) {
	rt, err := s.refreshRepo.Find(refreshToken)
	if err != nil {
		return "", fmt.Errorf("invalid refresh token")
	}

	return pkg.GenerateAcessToken(rt.UserID.String())
}

func (s *authService) Logout(refreshToken string) error {
	hashRefresh := pkg.HashToken(refreshToken)
	return s.refreshRepo.Delete(hashRefresh)
}
