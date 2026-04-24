package repository

import (
	"api/model"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type refreshTokenRepository struct {
	db *gorm.DB
}

func NewRefreshTokenRepository(db *gorm.DB) model.RefreshTokenRepository {
	return &refreshTokenRepository{db: db}
}

func (r *refreshTokenRepository) Create(userID uuid.UUID, token string) error {
	refreshToken := model.RefreshToken{
		UserID:    userID,
		Token:     token,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}

	return r.db.Create(&refreshToken).Error
}

func (r *refreshTokenRepository) Find(token string) (*model.RefreshToken, error) {
	var rt model.RefreshToken

	err := r.db.Where("token = ?", token).First(&rt).Error
	if err != nil {
		return nil, err
	}

	return &rt, nil
}

func (r *refreshTokenRepository) Delete(token string) error {
	return r.db.Where("token = ?", token).Delete(&model.RefreshToken{}).Error
}
