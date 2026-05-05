package repository

import (
	"api/model"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type followRepository struct {
	db *gorm.DB
}

func NewFollowRepository(db *gorm.DB) model.FollowRepository {
	return &followRepository{db: db}
}

func (r *followRepository) Create(f *model.Follow) error {
	return r.db.Create(f).Error
}

func (r *followRepository) Get(followerID, followingID uuid.UUID) (*model.Follow, error) {
	var follow model.Follow
	err := r.db.Where("follower_id = ? AND following_id = ?", followerID, followingID).First(&follow).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &follow, err
}

func (r *followRepository) UpdateStatus(id uuid.UUID, status model.FollowStatus) error {
	return r.db.Model(&model.Follow{}).Where("id = ?", id).Update("status", status).Error
}

func (r *followRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&model.Follow{}, "id = ?", id).Error
}

func (r *followRepository) GetPendingRequests(userID uuid.UUID) ([]model.Follow, error) {
	var follows []model.Follow
	err := r.db.Where("following_id = ? AND status = ?", userID, "pending").Find(&follows).Error

	return follows, err
}
