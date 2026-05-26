package service

import (
	"api/model"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CommentService interface {
	Create(comment *model.Comment) error
	GetByPostID(postID uuid.UUID) ([]model.Comment, error)
	Delete(id uuid.UUID, requesterID uuid.UUID) error
}

type commentService struct {
	repo model.CommentRepository
}

func NewCommentService(repo model.CommentRepository) CommentService {
	return &commentService{repo: repo}
}

func (s *commentService) Create(comment *model.Comment) error {
	if err := validate.Struct(comment); err != nil {
		return err
	}
	return s.repo.Create(comment)
}

func (s *commentService) GetByPostID(postID uuid.UUID) ([]model.Comment, error) {
	comments, err := s.repo.GetByPostID(postID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch comments: %w", err)
	}
	return comments, nil
}

func (s *commentService) Delete(id uuid.UUID, requesterID uuid.UUID) error {
	comment, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return gorm.ErrRecordNotFound
		}
		return fmt.Errorf("failed to fetch comment: %w", err)
	}
	if comment.AuthorID != requesterID {
		return fmt.Errorf("forbidden")
	}
	return s.repo.Delete(id)
}
