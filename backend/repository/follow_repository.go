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

func (r *followRepository) GetFollowers(userID uuid.UUID) ([]model.User, error) {
	var users []model.User

	err := r.db.Table("follows").
		Select("users.*").
		Joins("JOIN users ON users.id = follows.follower_id").
		Where("follows.following_id = ? AND follows.status = ?", userID, "accepted").
		Find(&users).Error

	return users, err
}

func (r *followRepository) GetFollowing(userID uuid.UUID) ([]model.User, error) {
	var users []model.User

	err := r.db.Table("follows").
		Select("users.*").
		Joins("JOIN users ON users.id = follows.following_id").
		Where("follows.follower_id = ? AND follows.status = ?", userID, "accepted").
		Find(&users).Error

	return users, err
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
	return &follow, nil
}

func (r *followRepository) GetByID(id uuid.UUID) (*model.Follow, error) {
	var follow model.Follow
	err := r.db.Where("id = ?", id).First(&follow).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &follow, nil
}

func (r *followRepository) UpdateStatus(id uuid.UUID, status model.FollowStatus) error {
	return r.db.Model(&model.Follow{}).Where("id = ?", id).Update("status", status).Error
}

func (r *followRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&model.Follow{}, "id = ?", id).Error
}

func (r *followRepository) GetPendingRequests(userID uuid.UUID) ([]model.FollowRequestPreview, error) {
	var previews []model.FollowRequestPreview

	err := r.db.Table("follows").
		Select("follows.id AS follow_id, follows.follower_id, follows.created_at, users.first_name, users.last_name, users.nick_name, users.avatar").
		Joins("JOIN users ON users.id = follows.follower_id").
		Where("follows.following_id = ? AND follows.status = ?", userID, "pending").
		Scan(&previews).Error

	return previews, err
}
