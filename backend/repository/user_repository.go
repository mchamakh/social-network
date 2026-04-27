package repository

import (
	"api/model"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) model.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(user *model.User) error {
	return r.db.Create(user).Error
}

func (r *userRepository) GetAll() ([]model.User, error) {
	var users []model.User
	err := r.db.Find(&users).Error
	if err != nil {
		return nil, err
	}
	return users, nil
}

func (r *userRepository) GetByEmail(email string) (*model.User, error) {
	var user model.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetByID(id uuid.UUID) (*model.User, error) {
	if id == uuid.Nil {
		return nil, fmt.Errorf("invalid uuid: nil value")
	}
	var user model.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) Delete(id uuid.UUID) error {
	if id == uuid.Nil {
		return fmt.Errorf("invalid uuid: nil value")
	}
	return r.db.Delete(&model.User{}, "id = ?", id).Error
}

func (r *userRepository) DeleteByID(userID uuid.UUID) error {
	if userID == uuid.Nil {
		return fmt.Errorf("invalid uuid : nil value")
	}
	return r.db.Where("user_id = ?", userID).Delete(&model.RefreshToken{}).Error
}
