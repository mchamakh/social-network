package service

import (
	"api/model"
	"errors"

	"github.com/google/uuid"
)

type FollowService interface {
	FollowUser(followerID, targetID uuid.UUID) error
	UnfollowUser(followerID, targetID uuid.UUID) error
	AcceptFollow(followID uuid.UUID) error
	RejectFollow(followID uuid.UUID) error
	GetPendingRequests(userID uuid.UUID) ([]model.Follow, error)
}

type followService struct {
	followRepo model.FollowRepository
	userRepo   model.UserRepository
}

func NewFollowService(f model.FollowRepository, u model.UserRepository) FollowService {
	return &followService{f, u}
}

func (s *followService) FollowUser(followerID, targetID uuid.UUID) error {
	if followerID == targetID {
		return errors.New("you cannot follow yourself")
	}
	existing, err := s.followRepo.Get(followerID, targetID)
	if err != nil {
		return err
	}
	if existing != nil {
		return errors.New("already followed or pending")
	}
	user, err := s.userRepo.GetByID(targetID)
	if err != nil {
		return err
	}
	status := model.Pending
	if user.IsPrivate {
		status = model.Pending
	}

	follow := &model.Follow{
		ID:          uuid.New(),
		FollowerID:  followerID,
		FollowingID: targetID,
		Status:      status,
	}
	return s.followRepo.Create(follow)
}
func (s *followService) UnfollowUser(followerID, targetID uuid.UUID) error {
	existing, err := s.followRepo.Get(followerID, targetID)
	if err != nil {
		return err
	}
	return s.followRepo.Delete(existing.ID)
}

func (s *followService) AcceptFollow(followID uuid.UUID) error {
	return s.followRepo.UpdateStatus(followID, model.Accepted)
}

func (s *followService) RejectFollow(followID uuid.UUID) error {
	return s.followRepo.Delete(followID)
}

func (s *followService) GetPendingRequests(userID uuid.UUID) ([]model.Follow, error) {
	return s.followRepo.GetPendingRequests(userID)
}
