package repository

import (
	"api/model"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type reactionRepository struct {
	db *gorm.DB
}

func NewReactionRepository(db *gorm.DB) model.ReactionRepository {
	return &reactionRepository{db: db}
}

func (r *reactionRepository) Upsert(reaction *model.Reaction) error {
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "post_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"reaction_type"}),
	}).Create(reaction).Error
}

func (r *reactionRepository) Delete(userID uuid.UUID, postID uuid.UUID) error {
	if userID == uuid.Nil || postID == uuid.Nil {
		return fmt.Errorf("invalid uuid: nil value")
	}
	return r.db.Delete(&model.Reaction{}, "user_id = ? AND post_id = ?", userID, postID).Error
}

func (r *reactionRepository) GetByPostID(postID uuid.UUID) ([]model.Reaction, error) {
	if postID == uuid.Nil {
		return nil, fmt.Errorf("invalid uuid: nil value")
	}
	var reactions []model.Reaction
	err := r.db.Where("post_id = ?", postID).Find(&reactions).Error
	if err != nil {
		return nil, err
	}
	return reactions, nil
}

func (r *reactionRepository) GetByUserAndPost(userID uuid.UUID, postID uuid.UUID) (*model.Reaction, error) {
	if userID == uuid.Nil || postID == uuid.Nil {
		return nil, fmt.Errorf("invalid uuid: nil value")
	}
	var reaction model.Reaction
	err := r.db.Where("user_id = ? AND post_id = ?", userID, postID).First(&reaction).Error
	if err != nil {
		return nil, err
	}
	return &reaction, nil
}
