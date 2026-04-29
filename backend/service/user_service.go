package service

import (
	"api/model"
	"fmt"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

var validate = validator.New()

type UserService interface {
	Create(user *model.User) error
	GetAll() ([]model.User, error)
	GetByID(id uuid.UUID) (*model.User, error)
	GetByEmail(email string) (*model.User, error)
	Delete(id uuid.UUID) error
}

type userService struct {
	repo model.UserRepository
}

func NewUserService(repo model.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) Create(user *model.User) error {
	err := validate.Struct(user)
	if err != nil {
		return err
	}
	return s.repo.Create(user)
}

func (s *userService) GetAll() ([]model.User, error) {
	users, err := s.repo.GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch users: %w", err)
	}
	return users, nil
}

func (s *userService) GetByEmail(email string) (*model.User, error) {
	user, err := s.repo.GetByEmail(email)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user by email: %w", err)
	}
	return user, nil
}

func (s *userService) GetByID(id uuid.UUID) (*model.User, error) {
	user, err := s.repo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user by id: %w", err)
	}
	return user, nil
}

func (s *userService) Delete(id uuid.UUID) error {
	err := s.repo.Delete(id)
	if err != nil {
		return fmt.Errorf("impossible to delete this user: %w", err)
	}
	return nil
}
