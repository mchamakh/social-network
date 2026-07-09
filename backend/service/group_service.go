package service

import (
	"api/model"
	"errors"
	"time"

	"github.com/google/uuid"
)

type GroupService interface {
	CreateGroup(creatorID uuid.UUID, title string, description *string) (*model.Group, error)
	ListGroups(userID uuid.UUID) ([]model.GroupListItem, error)
	GetGroupDetail(groupID, userID uuid.UUID) (*model.GroupDetail, error)

	RequestJoin(groupID, userID uuid.UUID) (creatorID uuid.UUID, err error)
	InviteUser(groupID, inviterID, targetID uuid.UUID) error
	AcceptRequest(groupID, creatorID, targetID uuid.UUID) error
	DeclineRequest(groupID, creatorID, targetID uuid.UUID) error
	AcceptInvitation(groupID, userID uuid.UUID) error
	DeclineInvitation(groupID, userID uuid.UUID) error
	GetPendingRequests(groupID, creatorID uuid.UUID) ([]model.MemberInfo, error)
	GetUserGroupIDs(userID uuid.UUID) ([]uuid.UUID, error)

	CreatePost(groupID, authorID uuid.UUID, content string, image *string) (*model.GroupPost, error)
	GetPosts(groupID, userID uuid.UUID) ([]model.GroupPostResponse, error)
	TogglePostLike(postID, userID uuid.UUID) (bool, error)
	GetPostComments(postID uuid.UUID) ([]model.GroupCommentResponse, error)
	AddPostComment(postID, authorID uuid.UUID, content string, image *string) (*model.GroupPostComment, error)

	CreateEvent(groupID, creatorID uuid.UUID, title string, description *string, eventTime time.Time) (*model.GroupEvent, []uuid.UUID, error)
	GetEvents(groupID, userID uuid.UUID) ([]model.GroupEventDetail, error)
	RespondToEvent(eventID, userID uuid.UUID, response string) error
}

type groupService struct {
	repo model.GroupRepository
}

func NewGroupService(r model.GroupRepository) GroupService {
	return &groupService{repo: r}
}

func (s *groupService) CreateGroup(creatorID uuid.UUID, title string, description *string) (*model.Group, error) {
	g := &model.Group{
		ID:          uuid.New(),
		CreatorID:   creatorID,
		Title:       title,
		Description: description,
	}
	if err := s.repo.Create(g); err != nil {
		return nil, err
	}
	// creator is automatically a member
	_ = s.repo.AddMember(g.ID, creatorID, model.MemberAccepted)
	return g, nil
}

func (s *groupService) ListGroups(userID uuid.UUID) ([]model.GroupListItem, error) {
	return s.repo.List(userID)
}

func (s *groupService) GetGroupDetail(groupID, userID uuid.UUID) (*model.GroupDetail, error) {
	return s.repo.GetDetail(groupID, userID)
}

func (s *groupService) RequestJoin(groupID, userID uuid.UUID) (uuid.UUID, error) {
	existing, err := s.repo.GetMember(groupID, userID)
	if err != nil {
		return uuid.Nil, err
	}
	if existing != nil {
		return uuid.Nil, errors.New("already a member or request pending")
	}
	g, err := s.repo.GetByID(groupID)
	if err != nil {
		return uuid.Nil, err
	}
	return g.CreatorID, s.repo.AddMember(groupID, userID, model.MemberRequested)
}

func (s *groupService) InviteUser(groupID, inviterID, targetID uuid.UUID) error {
	inviter, err := s.repo.GetMember(groupID, inviterID)
	if err != nil || inviter == nil || inviter.Status != model.MemberAccepted {
		return errors.New("you must be a member to invite")
	}
	existing, err := s.repo.GetMember(groupID, targetID)
	if err != nil {
		return err
	}
	if existing != nil {
		return errors.New("user already in group or invited")
	}
	return s.repo.AddMember(groupID, targetID, model.MemberInvited)
}

func (s *groupService) AcceptRequest(groupID, creatorID, targetID uuid.UUID) error {
	g, err := s.repo.GetByID(groupID)
	if err != nil {
		return err
	}
	if g.CreatorID != creatorID {
		return errors.New("only the creator can accept requests")
	}
	return s.repo.UpdateMemberStatus(groupID, targetID, model.MemberAccepted)
}

func (s *groupService) DeclineRequest(groupID, creatorID, targetID uuid.UUID) error {
	g, err := s.repo.GetByID(groupID)
	if err != nil {
		return err
	}
	if g.CreatorID != creatorID {
		return errors.New("only the creator can decline requests")
	}
	return s.repo.RemoveMember(groupID, targetID)
}

func (s *groupService) AcceptInvitation(groupID, userID uuid.UUID) error {
	return s.repo.UpdateMemberStatus(groupID, userID, model.MemberAccepted)
}

func (s *groupService) DeclineInvitation(groupID, userID uuid.UUID) error {
	return s.repo.RemoveMember(groupID, userID)
}

func (s *groupService) GetPendingRequests(groupID, creatorID uuid.UUID) ([]model.MemberInfo, error) {
	g, err := s.repo.GetByID(groupID)
	if err != nil {
		return nil, err
	}
	if g.CreatorID != creatorID {
		return nil, errors.New("forbidden")
	}
	return s.repo.GetPendingRequests(groupID)
}

func (s *groupService) GetUserGroupIDs(userID uuid.UUID) ([]uuid.UUID, error) {
	return s.repo.GetUserGroupIDs(userID)
}

func (s *groupService) CreatePost(groupID, authorID uuid.UUID, content string, image *string) (*model.GroupPost, error) {
	m, err := s.repo.GetMember(groupID, authorID)
	if err != nil || m == nil || m.Status != model.MemberAccepted {
		return nil, errors.New("must be a member to post")
	}
	p := &model.GroupPost{
		ID:       uuid.New(),
		GroupID:  groupID,
		AuthorID: authorID,
		Content:  content,
		Image:    image,
	}
	return p, s.repo.CreatePost(p)
}

func (s *groupService) GetPosts(groupID, userID uuid.UUID) ([]model.GroupPostResponse, error) {
	return s.repo.GetPosts(groupID, userID)
}

func (s *groupService) TogglePostLike(postID, userID uuid.UUID) (bool, error) {
	return s.repo.TogglePostLike(postID, userID)
}

func (s *groupService) GetPostComments(postID uuid.UUID) ([]model.GroupCommentResponse, error) {
	return s.repo.GetPostComments(postID)
}

func (s *groupService) AddPostComment(postID, authorID uuid.UUID, content string, image *string) (*model.GroupPostComment, error) {
	c := &model.GroupPostComment{
		ID:       uuid.New(),
		PostID:   postID,
		AuthorID: authorID,
		Content:  content,
		Image:    image,
	}
	return c, s.repo.AddPostComment(c)
}

func (s *groupService) CreateEvent(groupID, creatorID uuid.UUID, title string, description *string, eventTime time.Time) (*model.GroupEvent, []uuid.UUID, error) {
	m, err := s.repo.GetMember(groupID, creatorID)
	if err != nil || m == nil || m.Status != model.MemberAccepted {
		return nil, nil, errors.New("must be a member to create events")
	}
	e := &model.GroupEvent{
		ID:          uuid.New(),
		GroupID:     groupID,
		CreatorID:   creatorID,
		Title:       title,
		Description: description,
		EventTime:   eventTime,
	}
	if err := s.repo.CreateEvent(e); err != nil {
		return nil, nil, err
	}
	memberIDs, _ := s.repo.GetAcceptedMemberIDs(groupID)
	return e, memberIDs, nil
}

func (s *groupService) GetEvents(groupID, userID uuid.UUID) ([]model.GroupEventDetail, error) {
	return s.repo.GetEvents(groupID, userID)
}

func (s *groupService) RespondToEvent(eventID, userID uuid.UUID, response string) error {
	if response != "going" && response != "not_going" {
		return errors.New("invalid response: must be 'going' or 'not_going'")
	}
	return s.repo.RespondToEvent(eventID, userID, response)
}
