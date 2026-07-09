package repository

import (
	"api/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type messageRepository struct {
	db *gorm.DB
}

func NewMessageRepository(db *gorm.DB) model.MessageRepository {
	return &messageRepository{db: db}
}

func (r *messageRepository) SavePrivate(msg *model.PrivateMessage) error {
	return r.db.Create(msg).Error
}

func (r *messageRepository) GetPrivateHistory(userID, otherID uuid.UUID, limit int) ([]model.PrivateMessage, error) {
	var msgs []model.PrivateMessage
	err := r.db.
		Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
			userID, otherID, otherID, userID).
		Order("created_at ASC").
		Limit(limit).
		Find(&msgs).Error
	return msgs, err
}

func (r *messageRepository) GetConversations(userID uuid.UUID) ([]model.ConversationPreview, error) {
	var convs []model.ConversationPreview
	err := r.db.Raw(`
		SELECT
			other_user_id,
			u.first_name || ' ' || u.last_name AS other_name,
			COALESCE(u.nick_name, u.email) AS other_handle,
			u.avatar AS other_avatar,
			last_message,
			last_message_at,
			0 AS unread
		FROM (
			SELECT
				CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_user_id,
				content AS last_message,
				created_at AS last_message_at,
				ROW_NUMBER() OVER (
					PARTITION BY CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
					ORDER BY created_at DESC
				) AS rn
			FROM private_messages
			WHERE sender_id = ? OR receiver_id = ?
		) sub
		JOIN users u ON u.id = sub.other_user_id
		WHERE rn = 1
		ORDER BY last_message_at DESC
	`, userID, userID, userID, userID).Scan(&convs).Error
	return convs, err
}

func (r *messageRepository) SaveGroup(msg *model.GroupMessage) error {
	return r.db.Create(msg).Error
}

func (r *messageRepository) GetGroupHistory(groupID uuid.UUID, limit int) ([]model.GroupMessageResponse, error) {
	var msgs []model.GroupMessageResponse
	err := r.db.Raw(`
		SELECT
			m.id, m.group_id, m.content, m.image, m.created_at,
			m.author_id,
			u.first_name || ' ' || u.last_name AS author_name,
			COALESCE(u.nick_name, u.email) AS author_handle,
			u.avatar AS author_avatar
		FROM group_messages m
		JOIN users u ON u.id = m.author_id
		WHERE m.group_id = ?
		ORDER BY m.created_at ASC
		LIMIT ?
	`, groupID, limit).Scan(&msgs).Error
	return msgs, err
}
