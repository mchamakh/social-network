package repository

import (
	"api/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type groupRepository struct {
	db *gorm.DB
}

func NewGroupRepository(db *gorm.DB) model.GroupRepository {
	return &groupRepository{db: db}
}

func (r *groupRepository) Create(g *model.Group) error {
	return r.db.Create(g).Error
}

func (r *groupRepository) GetByID(id uuid.UUID) (*model.Group, error) {
	var g model.Group
	if err := r.db.First(&g, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &g, nil
}

func (r *groupRepository) List(userID uuid.UUID) ([]model.GroupListItem, error) {
	var items []model.GroupListItem
	err := r.db.Raw(`
		SELECT
			g.id, g.title, g.description, g.creator_id,
			COUNT(DISTINCT gm.user_id) FILTER (WHERE gm.status = 'accepted') AS member_count,
			(SELECT gm2.status FROM group_members gm2 WHERE gm2.group_id = g.id AND gm2.user_id = ?) AS my_status
		FROM groups g
		LEFT JOIN group_members gm ON gm.group_id = g.id
		GROUP BY g.id
		ORDER BY g.created_at DESC
	`, userID).Scan(&items).Error
	return items, err
}

func (r *groupRepository) GetDetail(groupID, userID uuid.UUID) (*model.GroupDetail, error) {
	// Scan into a Members-less row first: GORM's raw Scan errors out on the
	// GroupDetail.Members slice field since it has no matching SELECT column
	// or scanner/foreign key it can map to.
	var row struct {
		ID          uuid.UUID
		Title       string
		Description *string
		CreatorID   uuid.UUID
		MemberCount int64
		MyStatus    *model.MemberStatus
	}
	err := r.db.Raw(`
		SELECT
			g.id, g.title, g.description, g.creator_id,
			COUNT(DISTINCT gm.user_id) FILTER (WHERE gm.status = 'accepted') AS member_count,
			(SELECT gm2.status FROM group_members gm2 WHERE gm2.group_id = g.id AND gm2.user_id = ?) AS my_status
		FROM groups g
		LEFT JOIN group_members gm ON gm.group_id = g.id
		WHERE g.id = ?
		GROUP BY g.id
	`, userID, groupID).Scan(&row).Error
	if err != nil {
		return nil, err
	}
	if row.ID == uuid.Nil {
		return nil, gorm.ErrRecordNotFound
	}

	detail := model.GroupDetail{
		ID:          row.ID,
		Title:       row.Title,
		Description: row.Description,
		CreatorID:   row.CreatorID,
		MemberCount: row.MemberCount,
		MyStatus:    row.MyStatus,
	}

	var members []model.MemberInfo
	r.db.Raw(`
		SELECT
			gm.user_id, u.first_name, u.last_name, u.nick_name AS nickname, u.avatar,
			gm.status,
			(g.creator_id = gm.user_id) AS is_creator
		FROM group_members gm
		JOIN users u ON u.id = gm.user_id
		JOIN groups g ON g.id = gm.group_id
		WHERE gm.group_id = ? AND gm.status = 'accepted'
		ORDER BY is_creator DESC, gm.created_at ASC
	`, groupID).Scan(&members)
	detail.Members = members

	return &detail, nil
}

func (r *groupRepository) AddMember(groupID, userID uuid.UUID, status model.MemberStatus) error {
	return r.db.Create(&model.GroupMember{GroupID: groupID, UserID: userID, Status: status}).Error
}

func (r *groupRepository) GetMember(groupID, userID uuid.UUID) (*model.GroupMember, error) {
	var m model.GroupMember
	err := r.db.First(&m, "group_id = ? AND user_id = ?", groupID, userID).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &m, err
}

func (r *groupRepository) UpdateMemberStatus(groupID, userID uuid.UUID, status model.MemberStatus) error {
	return r.db.Model(&model.GroupMember{}).
		Where("group_id = ? AND user_id = ?", groupID, userID).
		Update("status", status).Error
}

func (r *groupRepository) RemoveMember(groupID, userID uuid.UUID) error {
	return r.db.Delete(&model.GroupMember{}, "group_id = ? AND user_id = ?", groupID, userID).Error
}

func (r *groupRepository) GetPendingRequests(groupID uuid.UUID) ([]model.MemberInfo, error) {
	var members []model.MemberInfo
	err := r.db.Raw(`
		SELECT gm.user_id, u.first_name, u.last_name, u.nick_name AS nickname, u.avatar, gm.status, false AS is_creator
		FROM group_members gm
		JOIN users u ON u.id = gm.user_id
		WHERE gm.group_id = ? AND gm.status = 'requested'
		ORDER BY gm.created_at ASC
	`, groupID).Scan(&members).Error
	return members, err
}

func (r *groupRepository) GetInvitations(userID uuid.UUID) ([]model.GroupListItem, error) {
	var items []model.GroupListItem
	err := r.db.Raw(`
		SELECT g.id, g.title, g.description, g.creator_id, 0 AS member_count, 'invited' AS my_status
		FROM group_members gm
		JOIN groups g ON g.id = gm.group_id
		WHERE gm.user_id = ? AND gm.status = 'invited'
	`, userID).Scan(&items).Error
	return items, err
}

func (r *groupRepository) CreatePost(p *model.GroupPost) error {
	return r.db.Create(p).Error
}

func (r *groupRepository) GetPosts(groupID, userID uuid.UUID) ([]model.GroupPostResponse, error) {
	var posts []model.GroupPostResponse
	err := r.db.Raw(`
		SELECT
			p.id, p.group_id, p.content, p.image, p.created_at,
			p.author_id,
			u.first_name || ' ' || u.last_name AS author_name,
			COALESCE(u.nick_name, u.email) AS author_handle,
			u.avatar AS author_avatar,
			COUNT(DISTINCT l.user_id) AS likes_count,
			COUNT(DISTINCT c.id) AS comments_count,
			EXISTS(SELECT 1 FROM group_post_likes WHERE post_id = p.id AND user_id = ?) AS liked
		FROM group_posts p
		JOIN users u ON u.id = p.author_id
		LEFT JOIN group_post_likes l ON l.post_id = p.id
		LEFT JOIN group_post_comments c ON c.post_id = p.id
		WHERE p.group_id = ?
		GROUP BY p.id, u.first_name, u.last_name, u.nick_name, u.email, u.avatar
		ORDER BY p.created_at DESC
	`, userID, groupID).Scan(&posts).Error
	return posts, err
}

func (r *groupRepository) TogglePostLike(postID, userID uuid.UUID) (bool, error) {
	var like model.GroupPostLike
	err := r.db.First(&like, "post_id = ? AND user_id = ?", postID, userID).Error
	if err == gorm.ErrRecordNotFound {
		return true, r.db.Create(&model.GroupPostLike{PostID: postID, UserID: userID}).Error
	}
	if err != nil {
		return false, err
	}
	return false, r.db.Delete(&model.GroupPostLike{}, "post_id = ? AND user_id = ?", postID, userID).Error
}

func (r *groupRepository) GetPostComments(postID uuid.UUID) ([]model.GroupCommentResponse, error) {
	var comments []model.GroupCommentResponse
	err := r.db.Raw(`
		SELECT
			c.id, c.post_id, c.content, c.image, c.created_at,
			c.author_id,
			u.first_name || ' ' || u.last_name AS author_name,
			COALESCE(u.nick_name, u.email) AS author_handle,
			u.avatar AS author_avatar
		FROM group_post_comments c
		JOIN users u ON u.id = c.author_id
		WHERE c.post_id = ?
		ORDER BY c.created_at ASC
	`, postID).Scan(&comments).Error
	return comments, err
}

func (r *groupRepository) AddPostComment(c *model.GroupPostComment) error {
	return r.db.Create(c).Error
}

func (r *groupRepository) CreateEvent(e *model.GroupEvent) error {
	return r.db.Create(e).Error
}

func (r *groupRepository) GetEvents(groupID, userID uuid.UUID) ([]model.GroupEventDetail, error) {
	var events []model.GroupEventDetail
	err := r.db.Raw(`
		SELECT
			e.id, e.group_id, e.creator_id, e.title, e.description, e.event_time, e.created_at,
			COUNT(r.user_id) FILTER (WHERE r.response = 'going') AS going,
			COUNT(r.user_id) FILTER (WHERE r.response = 'not_going') AS not_going,
			(SELECT r2.response FROM group_event_responses r2 WHERE r2.event_id = e.id AND r2.user_id = ?) AS my_response
		FROM group_events e
		LEFT JOIN group_event_responses r ON r.event_id = e.id
		WHERE e.group_id = ?
		GROUP BY e.id
		ORDER BY e.event_time ASC
	`, userID, groupID).Scan(&events).Error
	return events, err
}

func (r *groupRepository) RespondToEvent(eventID, userID uuid.UUID, response string) error {
	return r.db.Exec(`
		INSERT INTO group_event_responses (event_id, user_id, response)
		VALUES (?, ?, ?)
		ON CONFLICT (event_id, user_id) DO UPDATE SET response = EXCLUDED.response
	`, eventID, userID, response).Error
}

func (r *groupRepository) GetAcceptedMemberIDs(groupID uuid.UUID) ([]uuid.UUID, error) {
	var ids []uuid.UUID
	err := r.db.Model(&model.GroupMember{}).
		Where("group_id = ? AND status = 'accepted'", groupID).
		Pluck("user_id", &ids).Error
	return ids, err
}

func (r *groupRepository) GetUserGroupIDs(userID uuid.UUID) ([]uuid.UUID, error) {
	var ids []uuid.UUID
	err := r.db.Model(&model.GroupMember{}).
		Where("user_id = ? AND status = 'accepted'", userID).
		Pluck("group_id", &ids).Error
	return ids, err
}
