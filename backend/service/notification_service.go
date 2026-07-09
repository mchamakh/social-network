package service

import (
	"api/model"
	ws "api/websocket"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type NotificationService interface {
	Notify(userID uuid.UUID, notifType string, actorID, referenceID *uuid.UUID, content string) error
	GetForUser(userID uuid.UUID) ([]model.Notification, error)
	MarkRead(notifID, userID uuid.UUID) error
	MarkAllRead(userID uuid.UUID) error
	UnreadCount(userID uuid.UUID) (int64, error)
}

type notificationService struct {
	repo model.NotificationRepository
	hub  *ws.Hub
}

func NewNotificationService(r model.NotificationRepository, hub *ws.Hub) NotificationService {
	return &notificationService{repo: r, hub: hub}
}

func (s *notificationService) Notify(userID uuid.UUID, notifType string, actorID, referenceID *uuid.UUID, content string) error {
	n := &model.Notification{
		ID:          uuid.New(),
		UserID:      userID,
		Type:        notifType,
		ActorID:     actorID,
		ReferenceID: referenceID,
		Content:     content,
	}
	if err := s.repo.Create(n); err != nil {
		return err
	}

	payload, _ := json.Marshal(n)
	targetStr := userID.String()
	s.hub.Broadcast <- ws.Message{
		Type:      ws.MessageTypeNotification,
		SenderID:  "system",
		TargetID:  &targetStr,
		Payload:   string(payload),
		CreatedAt: time.Now(),
	}
	return nil
}

func (s *notificationService) GetForUser(userID uuid.UUID) ([]model.Notification, error) {
	return s.repo.GetByUser(userID)
}

func (s *notificationService) MarkRead(notifID, userID uuid.UUID) error {
	return s.repo.MarkRead(notifID, userID)
}

func (s *notificationService) MarkAllRead(userID uuid.UUID) error {
	return s.repo.MarkAllRead(userID)
}

func (s *notificationService) UnreadCount(userID uuid.UUID) (int64, error) {
	return s.repo.UnreadCount(userID)
}
