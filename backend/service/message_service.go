package service

import (
	"api/model"
	ws "api/websocket"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
)

type MessageService interface {
	SendPrivate(senderID, receiverID uuid.UUID, content string, image *string) (*model.PrivateMessage, error)
	GetPrivateHistory(userID, otherID uuid.UUID) ([]model.PrivateMessage, error)
	GetConversations(userID uuid.UUID) ([]model.ConversationPreview, error)

	SendGroupMessage(groupID, authorID uuid.UUID, content string, image *string) (*model.GroupMessage, error)
	GetGroupHistory(groupID uuid.UUID) ([]model.GroupMessageResponse, error)
}

type messageService struct {
	repo       model.MessageRepository
	followRepo model.FollowRepository
	hub        *ws.Hub
}

func NewMessageService(r model.MessageRepository, followRepo model.FollowRepository, hub *ws.Hub) MessageService {
	return &messageService{repo: r, followRepo: followRepo, hub: hub}
}

func (s *messageService) SendPrivate(senderID, receiverID uuid.UUID, content string, image *string) (*model.PrivateMessage, error) {
	if senderID == receiverID {
		return nil, errors.New("cannot message yourself")
	}
	senderFollows, err := s.followRepo.Get(senderID, receiverID)
	if err != nil {
		return nil, err
	}
	receiverFollows, err := s.followRepo.Get(receiverID, senderID)
	if err != nil {
		return nil, err
	}
	following := senderFollows != nil && senderFollows.Status == model.Accepted
	followedBy := receiverFollows != nil && receiverFollows.Status == model.Accepted
	if !following && !followedBy {
		return nil, errors.New("you must be following or be followed by this user to message them")
	}

	msg := &model.PrivateMessage{
		ID:         uuid.New(),
		SenderID:   senderID,
		ReceiverID: receiverID,
		Content:    content,
		Image:      image,
	}
	if err := s.repo.SavePrivate(msg); err != nil {
		return nil, err
	}

	payload, _ := json.Marshal(msg)
	receiverStr := receiverID.String()
	s.hub.Broadcast <- ws.Message{
		Type:      ws.MessageTypeChatPrivate,
		SenderID:  senderID.String(),
		TargetID:  &receiverStr,
		Payload:   string(payload),
		CreatedAt: time.Now(),
	}
	return msg, nil
}

func (s *messageService) GetPrivateHistory(userID, otherID uuid.UUID) ([]model.PrivateMessage, error) {
	return s.repo.GetPrivateHistory(userID, otherID, 100)
}

func (s *messageService) GetConversations(userID uuid.UUID) ([]model.ConversationPreview, error) {
	return s.repo.GetConversations(userID)
}

func (s *messageService) SendGroupMessage(groupID, authorID uuid.UUID, content string, image *string) (*model.GroupMessage, error) {
	msg := &model.GroupMessage{
		ID:       uuid.New(),
		GroupID:  groupID,
		AuthorID: authorID,
		Content:  content,
		Image:    image,
	}
	if err := s.repo.SaveGroup(msg); err != nil {
		return nil, err
	}

	payload, _ := json.Marshal(msg)
	groupIDStr := groupID.String()
	s.hub.Broadcast <- ws.Message{
		Type:      ws.MessageTypeChatGroup,
		SenderID:  authorID.String(),
		GroupID:   &groupIDStr,
		Payload:   string(payload),
		CreatedAt: time.Now(),
	}
	return msg, nil
}

func (s *messageService) GetGroupHistory(groupID uuid.UUID) ([]model.GroupMessageResponse, error) {
	return s.repo.GetGroupHistory(groupID, 100)
}
