package repository

import (
	"api/model"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type postRepository struct {
	db *gorm.DB
}

func NewPostRepository(db *gorm.DB) model.PostRepository {
	return &postRepository{db: db}
}

func (r *postRepository) Create(post *model.Post) error {
	return r.db.Create(post).Error
}

func (r *postRepository) GetAll() ([]model.Post, error) {
	var posts []model.Post
	err := r.db.Order("created_at DESC").Find(&posts).Error
	if err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *postRepository) GetByID(id uuid.UUID) (*model.Post, error) {
	if id == uuid.Nil {
		return nil, fmt.Errorf("invalid uuid: nil value")
	}
	var post model.Post
	err := r.db.First(&post, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &post, nil
}

func (r *postRepository) GetByAuthorID(authorID uuid.UUID) ([]model.Post, error) {
	if authorID == uuid.Nil {
		return nil, fmt.Errorf("invalid uuid: nil value")
	}
	var posts []model.Post
	err := r.db.Where("author_id = ?", authorID).Order("created_at DESC").Find(&posts).Error
	if err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *postRepository) Delete(id uuid.UUID) error {
	if id == uuid.Nil {
		return fmt.Errorf("invalid uuid: nil value")
	}
	return r.db.Delete(&model.Post{}, "id = ?", id).Error
}
