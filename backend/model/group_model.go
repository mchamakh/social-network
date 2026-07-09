package model

import (
	"time"

	"github.com/google/uuid"
)

type MemberStatus string

const (
	MemberInvited   MemberStatus = "invited"
	MemberRequested MemberStatus = "requested"
	MemberAccepted  MemberStatus = "accepted"
)

type Group struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	CreatorID   uuid.UUID `gorm:"not null" json:"creator_id"`
	Title       string    `gorm:"not null" json:"title"`
	Description *string   `json:"description,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

type GroupMember struct {
	GroupID   uuid.UUID    `gorm:"primaryKey" json:"group_id"`
	UserID    uuid.UUID    `gorm:"primaryKey" json:"user_id"`
	Status    MemberStatus `gorm:"not null;default:'accepted'" json:"status"`
	CreatedAt time.Time    `json:"created_at"`
}

type GroupPost struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	GroupID   uuid.UUID `gorm:"not null" json:"group_id"`
	AuthorID  uuid.UUID `gorm:"not null" json:"author_id"`
	Content   string    `gorm:"not null" json:"content"`
	Image     *string   `json:"image,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type GroupPostLike struct {
	PostID uuid.UUID `gorm:"primaryKey" json:"post_id"`
	UserID uuid.UUID `gorm:"primaryKey" json:"user_id"`
}

type GroupPostComment struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	PostID    uuid.UUID `gorm:"not null" json:"post_id"`
	AuthorID  uuid.UUID `gorm:"not null" json:"author_id"`
	Content   string    `gorm:"not null" json:"content"`
	Image     *string   `json:"image,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type GroupEvent struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	GroupID     uuid.UUID `gorm:"not null" json:"group_id"`
	CreatorID   uuid.UUID `gorm:"not null" json:"creator_id"`
	Title       string    `gorm:"not null" json:"title"`
	Description *string   `json:"description,omitempty"`
	EventTime   time.Time `gorm:"not null" json:"event_time"`
	CreatedAt   time.Time `json:"created_at"`
}

type GroupEventResponse struct {
	EventID  uuid.UUID `gorm:"primaryKey" json:"event_id"`
	UserID   uuid.UUID `gorm:"primaryKey" json:"user_id"`
	Response string    `gorm:"not null" json:"response"`
}

// Response DTOs

type GroupListItem struct {
	ID          uuid.UUID    `json:"id"`
	Title       string       `json:"title"`
	Description *string      `json:"description,omitempty"`
	CreatorID   uuid.UUID    `json:"creator_id"`
	MemberCount int64        `json:"member_count"`
	MyStatus    *MemberStatus `json:"my_status"`
}

type GroupDetail struct {
	ID          uuid.UUID    `json:"id"`
	Title       string       `json:"title"`
	Description *string      `json:"description,omitempty"`
	CreatorID   uuid.UUID    `json:"creator_id"`
	MemberCount int64        `json:"member_count"`
	MyStatus    *MemberStatus `json:"my_status"`
	Members     []MemberInfo `json:"members"`
}

type MemberInfo struct {
	UserID    uuid.UUID    `json:"user_id"`
	FirstName string       `json:"first_name"`
	LastName  string       `json:"last_name"`
	Nickname  *string      `json:"nickname,omitempty"`
	Avatar    *string      `json:"avatar,omitempty"`
	Status    MemberStatus `json:"status"`
	IsCreator bool         `json:"is_creator"`
}

type GroupPostResponse struct {
	ID           uuid.UUID `json:"id"`
	GroupID      uuid.UUID `json:"group_id"`
	Content      string    `json:"content"`
	Image        *string   `json:"image,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	AuthorID     uuid.UUID `json:"author_id"`
	AuthorName   string    `json:"author_name"`
	AuthorHandle string    `json:"author_handle"`
	AuthorAvatar *string   `json:"author_avatar,omitempty"`
	LikesCount   int64     `json:"likes_count"`
	CommentsCount int64    `json:"comments_count"`
	Liked        bool      `json:"liked"`
}

type GroupCommentResponse struct {
	ID           uuid.UUID `json:"id"`
	PostID       uuid.UUID `json:"post_id"`
	Content      string    `json:"content"`
	Image        *string   `json:"image,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	AuthorID     uuid.UUID `json:"author_id"`
	AuthorName   string    `json:"author_name"`
	AuthorHandle string    `json:"author_handle"`
	AuthorAvatar *string   `json:"author_avatar,omitempty"`
}

type GroupEventDetail struct {
	ID          uuid.UUID `json:"id"`
	GroupID     uuid.UUID `json:"group_id"`
	CreatorID   uuid.UUID `json:"creator_id"`
	Title       string    `json:"title"`
	Description *string   `json:"description,omitempty"`
	EventTime   time.Time `json:"event_time"`
	CreatedAt   time.Time `json:"created_at"`
	Going       int64     `json:"going"`
	NotGoing    int64     `json:"not_going"`
	MyResponse  *string   `json:"my_response"`
}

type GroupRepository interface {
	Create(g *Group) error
	GetByID(id uuid.UUID) (*Group, error)
	List(userID uuid.UUID) ([]GroupListItem, error)
	GetDetail(groupID, userID uuid.UUID) (*GroupDetail, error)

	AddMember(groupID, userID uuid.UUID, status MemberStatus) error
	GetMember(groupID, userID uuid.UUID) (*GroupMember, error)
	UpdateMemberStatus(groupID, userID uuid.UUID, status MemberStatus) error
	RemoveMember(groupID, userID uuid.UUID) error
	GetPendingRequests(groupID uuid.UUID) ([]MemberInfo, error)
	GetInvitations(userID uuid.UUID) ([]GroupListItem, error)
	GetAcceptedMemberIDs(groupID uuid.UUID) ([]uuid.UUID, error)
	GetUserGroupIDs(userID uuid.UUID) ([]uuid.UUID, error)

	CreatePost(p *GroupPost) error
	GetPosts(groupID, userID uuid.UUID) ([]GroupPostResponse, error)
	TogglePostLike(postID, userID uuid.UUID) (bool, error)
	GetPostComments(postID uuid.UUID) ([]GroupCommentResponse, error)
	AddPostComment(c *GroupPostComment) error

	CreateEvent(e *GroupEvent) error
	GetEvents(groupID, userID uuid.UUID) ([]GroupEventDetail, error)
	RespondToEvent(eventID, userID uuid.UUID, response string) error
}
