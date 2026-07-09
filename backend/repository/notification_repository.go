package repository

import (
	"api/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type notificationRepository struct {
	db *gorm.DB
}

func NewNotificationRepository(db *gorm.DB) model.NotificationRepository {
	return &notificationRepository{db: db}
}

func (r *notificationRepository) Create(n *model.Notification) error {
	return r.db.Create(n).Error
}

func (r *notificationRepository) GetByUser(userID uuid.UUID) ([]model.Notification, error) {
	var notifs []model.Notification
	err := r.db.
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(50).
		Find(&notifs).Error
	return notifs, err
}

func (r *notificationRepository) MarkRead(notifID, userID uuid.UUID) error {
	return r.db.Model(&model.Notification{}).
		Where("id = ? AND user_id = ?", notifID, userID).
		Update("read", true).Error
}

func (r *notificationRepository) MarkAllRead(userID uuid.UUID) error {
	return r.db.Model(&model.Notification{}).
		Where("user_id = ? AND read = false", userID).
		Update("read", true).Error
}

func (r *notificationRepository) UnreadCount(userID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&model.Notification{}).
		Where("user_id = ? AND read = false", userID).
		Count(&count).Error
	return count, err
}
