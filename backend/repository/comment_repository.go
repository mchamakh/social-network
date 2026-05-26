package repository

import (
	"api/model"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type commentRepository struct {
	db *gorm.DB
}

func NewCommentRepository(db *gorm.DB) model.CommentRepository {
	return &commentRepository{db: db}
}

func (r *commentRepository) Create(comment *model.Comment) error {
	return r.db.Create(comment).Error
}

func (r *commentRepository) GetByPostID(postID uuid.UUID) ([]model.Comment, error) {
	if postID == uuid.Nil {
		return nil, fmt.Errorf("invalid uuid: nil value")
	}
	var comments []model.Comment
	err := r.db.Where("post_id = ?", postID).Order("created_at ASC").Find(&comments).Error
	if err != nil {
		return nil, err
	}
	return comments, nil
}

func (r *commentRepository) GetByID(id uuid.UUID) (*model.Comment, error) {
	if id == uuid.Nil {
		return nil, fmt.Errorf("invalid uuid: nil value")
	}
	var comment model.Comment
	err := r.db.First(&comment, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

func (r *commentRepository) Delete(id uuid.UUID) error {
	if id == uuid.Nil {
		return fmt.Errorf("invalid uuid: nil value")
	}
	return r.db.Delete(&model.Comment{}, "id = ?", id).Error
}
