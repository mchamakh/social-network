package service

import (
	"api/model"
	ws "api/websocket"
	"errors"
	"time"

	"github.com/google/uuid"
)

type PostService interface {
	CreatePost(authorID uuid.UUID, content string, image *string, privacy model.PostPrivacy, allowedUsers []uuid.UUID) (*model.Post, error)
	GetFeed(userID uuid.UUID) ([]model.PostResponse, error)
	GetByAuthor(authorID, viewerID uuid.UUID) ([]model.PostResponse, error)
	DeletePost(postID, userID uuid.UUID) error
	ToggleLike(postID, userID uuid.UUID) (bool, error)
	GetComments(postID uuid.UUID) ([]model.CommentResponse, error)
	AddComment(postID, authorID uuid.UUID, content string, image *string) (*model.Comment, error)
}

type postService struct {
	repo model.PostRepository
	hub  *ws.Hub
}

func NewPostService(r model.PostRepository, hub *ws.Hub) PostService {
	return &postService{repo: r, hub: hub}
}

func (s *postService) CreatePost(authorID uuid.UUID, content string, image *string, privacy model.PostPrivacy, allowedUsers []uuid.UUID) (*model.Post, error) {
	post := &model.Post{
		ID:       uuid.New(),
		AuthorID: authorID,
		Content:  content,
		Image:    image,
		Privacy:  privacy,
	}
	if err := s.repo.Create(post); err != nil {
		return nil, err
	}
	for _, uid := range allowedUsers {
		_ = s.repo.AddPrivacyUser(post.ID, uid)
	}

	s.hub.Broadcast <- ws.Message{
		Type:      ws.MessageTypeFeedUpdate,
		SenderID:  authorID.String(),
		CreatedAt: time.Now(),
	}

	return post, nil
}

func (s *postService) GetFeed(userID uuid.UUID) ([]model.PostResponse, error) {
	return s.repo.GetFeed(userID)
}

func (s *postService) GetByAuthor(authorID, viewerID uuid.UUID) ([]model.PostResponse, error) {
	return s.repo.GetByAuthor(authorID, viewerID)
}

func (s *postService) DeletePost(postID, userID uuid.UUID) error {
	post, err := s.repo.GetByID(postID)
	if err != nil {
		return errors.New("post not found")
	}
	if post.AuthorID != userID {
		return errors.New("forbidden")
	}
	return s.repo.Delete(postID)
}

func (s *postService) ToggleLike(postID, userID uuid.UUID) (bool, error) {
	return s.repo.ToggleLike(postID, userID)
}

func (s *postService) GetComments(postID uuid.UUID) ([]model.CommentResponse, error) {
	return s.repo.GetComments(postID)
}

func (s *postService) AddComment(postID, authorID uuid.UUID, content string, image *string) (*model.Comment, error) {
	c := &model.Comment{
		ID:       uuid.New(),
		PostID:   postID,
		AuthorID: authorID,
		Content:  content,
		Image:    image,
	}
	return c, s.repo.AddComment(c)
}
