package service

import (
	"api/model"
	"errors"

	"github.com/google/uuid"
)

type FollowService interface {
	FollowUser(followerID, targetID uuid.UUID) (follow *model.Follow, err error)
	UnfollowUser(followerID, targetID uuid.UUID) error
	AcceptFollow(followID, userID uuid.UUID) error
	RejectFollow(followID, userID uuid.UUID) error
	GetPendingRequests(userID uuid.UUID) ([]model.FollowRequestPreview, error)
	GetFollowers(userID uuid.UUID) ([]model.User, error)
	GetFollowing(userID uuid.UUID) ([]model.User, error)
	GetFollowStatus(viewerID, targetID uuid.UUID) (string, error)
	CanViewProfile(viewerID, targetID uuid.UUID) (bool, error)
}

type followService struct {
	followRepo model.FollowRepository
	userRepo   model.UserRepository
}

func NewFollowService(f model.FollowRepository, u model.UserRepository) FollowService {
	return &followService{f, u}
}

func (s *followService) FollowUser(followerID, targetID uuid.UUID) (*model.Follow, error) {
	if followerID == targetID {
		return nil, errors.New("you cannot follow yourself")
	}
	existing, err := s.followRepo.Get(followerID, targetID)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("already followed or pending")
	}
	user, err := s.userRepo.GetByID(targetID)
	if err != nil {
		return nil, err
	}
	status := model.Accepted
	if user.IsPrivate {
		status = model.Pending
	}
	follow := &model.Follow{
		ID:          uuid.New(),
		FollowerID:  followerID,
		FollowingID: targetID,
		Status:      status,
	}
	if err := s.followRepo.Create(follow); err != nil {
		return nil, err
	}
	return follow, nil
}

func (s *followService) UnfollowUser(followerID, targetID uuid.UUID) error {
	existing, err := s.followRepo.Get(followerID, targetID)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("follow not found")
	}
	return s.followRepo.Delete(existing.ID)
}

func (s *followService) AcceptFollow(followID, userID uuid.UUID) error {
	follow, err := s.followRepo.GetByID(followID)
	if err != nil {
		return err
	}
	if follow == nil || follow.FollowingID != userID {
		return errors.New("follow request not found")
	}
	return s.followRepo.UpdateStatus(followID, model.Accepted)
}

func (s *followService) RejectFollow(followID, userID uuid.UUID) error {
	follow, err := s.followRepo.GetByID(followID)
	if err != nil {
		return err
	}
	if follow == nil || follow.FollowingID != userID {
		return errors.New("follow request not found")
	}
	return s.followRepo.Delete(followID)
}

func (s *followService) GetPendingRequests(userID uuid.UUID) ([]model.FollowRequestPreview, error) {
	return s.followRepo.GetPendingRequests(userID)
}

func (s *followService) GetFollowers(userID uuid.UUID) ([]model.User, error) {
	return s.followRepo.GetFollowers(userID)
}

func (s *followService) GetFollowing(userID uuid.UUID) ([]model.User, error) {
	return s.followRepo.GetFollowing(userID)
}

func (s *followService) GetFollowStatus(viewerID, targetID uuid.UUID) (string, error) {
	if viewerID == targetID {
		return "self", nil
	}
	follow, err := s.followRepo.Get(viewerID, targetID)
	if err != nil {
		return "", err
	}
	if follow == nil {
		return "none", nil
	}
	return string(follow.Status), nil
}

func (s *followService) CanViewProfile(viewerID, targetID uuid.UUID) (bool, error) {
	if viewerID == targetID {
		return true, nil
	}
	target, err := s.userRepo.GetByID(targetID)
	if err != nil {
		return false, err
	}
	if !target.IsPrivate {
		return true, nil
	}
	follow, err := s.followRepo.Get(viewerID, targetID)
	if err != nil {
		return false, err
	}
	return follow != nil && follow.Status == model.Accepted, nil
}
