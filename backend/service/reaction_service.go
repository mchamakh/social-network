package service

import (
	"api/model"
	"fmt"

	"github.com/google/uuid"
)

type ReactionSummary struct {
	Likes    int64               `json:"likes"`
	Dislikes int64               `json:"dislikes"`
	UserReaction *model.ReactionType `json:"user_reaction"`
}

type ReactionService interface {
	Toggle(userID uuid.UUID, postID uuid.UUID, reactionType model.ReactionType) error
	Remove(userID uuid.UUID, postID uuid.UUID) error
	GetSummary(userID uuid.UUID, postID uuid.UUID) (*ReactionSummary, error)
}

type reactionService struct {
	repo model.ReactionRepository
}

func NewReactionService(repo model.ReactionRepository) ReactionService {
	return &reactionService{repo: repo}
}

func (s *reactionService) Toggle(userID uuid.UUID, postID uuid.UUID, reactionType model.ReactionType) error {
	if reactionType != model.ReactionLike && reactionType != model.ReactionDislike {
		return fmt.Errorf("invalid reaction type")
	}
	reaction := &model.Reaction{
		UserID:       userID,
		PostID:       postID,
		ReactionType: reactionType,
	}
	return s.repo.Upsert(reaction)
}

func (s *reactionService) Remove(userID uuid.UUID, postID uuid.UUID) error {
	return s.repo.Delete(userID, postID)
}

func (s *reactionService) GetSummary(userID uuid.UUID, postID uuid.UUID) (*ReactionSummary, error) {
	reactions, err := s.repo.GetByPostID(postID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch reactions: %w", err)
	}

	summary := &ReactionSummary{}
	for _, r := range reactions {
		if r.ReactionType == model.ReactionLike {
			summary.Likes++
		} else {
			summary.Dislikes++
		}
	}

	userReaction, err := s.repo.GetByUserAndPost(userID, postID)
	if err == nil {
		summary.UserReaction = &userReaction.ReactionType
	}

	return summary, nil
}
