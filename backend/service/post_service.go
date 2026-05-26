package service

import (
	"api/model"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostService interface {
	Create(post *model.Post) error
	GetAll() ([]model.Post, error)
	GetByID(id uuid.UUID) (*model.Post, error)
	GetByAuthorID(authorID uuid.UUID) ([]model.Post, error)
	Delete(id uuid.UUID, requesterID uuid.UUID) error
}

type postService struct {
	repo model.PostRepository
}

func NewPostService(repo model.PostRepository) PostService {
	return &postService{repo: repo}
}

func (s *postService) Create(post *model.Post) error {
	if err := validate.Struct(post); err != nil {
		return err
	}
	return s.repo.Create(post)
}

func (s *postService) GetAll() ([]model.Post, error) {
	posts, err := s.repo.GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch posts: %w", err)
	}
	return posts, nil
}

func (s *postService) GetByID(id uuid.UUID) (*model.Post, error) {
	post, err := s.repo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch post: %w", err)
	}
	return post, nil
}

func (s *postService) GetByAuthorID(authorID uuid.UUID) ([]model.Post, error) {
	posts, err := s.repo.GetByAuthorID(authorID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch posts by author: %w", err)
	}
	return posts, nil
}

func (s *postService) Delete(id uuid.UUID, requesterID uuid.UUID) error {
	post, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return gorm.ErrRecordNotFound
		}
		return fmt.Errorf("failed to fetch post: %w", err)
	}
	if post.AuthorID != requesterID {
		return fmt.Errorf("forbidden")
	}
	return s.repo.Delete(id)
}
