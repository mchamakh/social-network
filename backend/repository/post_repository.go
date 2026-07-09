package repository

import (
	"api/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type postRepository struct {
	db *gorm.DB
}

func NewPostRepository(db *gorm.DB) model.PostRepository {
	return &postRepository{db: db}
}

func (r *postRepository) Create(post *model.Post) error {
	return r.db.Create(post).Error
}

func (r *postRepository) GetByID(id uuid.UUID) (*model.Post, error) {
	var post model.Post
	if err := r.db.First(&post, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &post, nil
}

func (r *postRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&model.Post{}, "id = ?", id).Error
}

func (r *postRepository) AddPrivacyUser(postID, userID uuid.UUID) error {
	return r.db.Create(&model.PostPrivacyUser{PostID: postID, UserID: userID}).Error
}

func (r *postRepository) ToggleLike(postID, userID uuid.UUID) (bool, error) {
	var like model.Like
	err := r.db.First(&like, "post_id = ? AND user_id = ?", postID, userID).Error
	if err == gorm.ErrRecordNotFound {
		return true, r.db.Create(&model.Like{PostID: postID, UserID: userID}).Error
	}
	if err != nil {
		return false, err
	}
	return false, r.db.Delete(&model.Like{}, "post_id = ? AND user_id = ?", postID, userID).Error
}

func (r *postRepository) GetFeed(userID uuid.UUID) ([]model.PostResponse, error) {
	var posts []model.PostResponse

	err := r.db.Raw(`
		SELECT
			p.id, p.content, p.image, p.privacy, p.created_at,
			p.author_id,
			u.first_name || ' ' || u.last_name AS author_name,
			COALESCE(u.nick_name, u.email) AS author_handle,
			u.avatar AS author_avatar,
			COUNT(DISTINCT l.user_id) AS likes_count,
			COUNT(DISTINCT c.id) AS comments_count,
			EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) AS liked
		FROM posts p
		JOIN users u ON u.id = p.author_id
		LEFT JOIN likes l ON l.post_id = p.id
		LEFT JOIN comments c ON c.post_id = p.id
		WHERE (
			p.privacy = 'public'
			OR p.author_id = ?
			OR (p.privacy = 'almost_private' AND EXISTS(
				SELECT 1 FROM follows
				WHERE follower_id = ? AND following_id = p.author_id AND status = 'accepted'
			))
			OR (p.privacy = 'private' AND EXISTS(
				SELECT 1 FROM post_privacy_users
				WHERE post_id = p.id AND user_id = ?
			))
		)
		GROUP BY p.id, u.first_name, u.last_name, u.nick_name, u.email, u.avatar
		ORDER BY p.created_at DESC
	`, userID, userID, userID, userID).Scan(&posts).Error

	return posts, err
}

func (r *postRepository) GetByAuthor(authorID, viewerID uuid.UUID) ([]model.PostResponse, error) {
	var posts []model.PostResponse

	err := r.db.Raw(`
		SELECT
			p.id, p.content, p.image, p.privacy, p.created_at,
			p.author_id,
			u.first_name || ' ' || u.last_name AS author_name,
			COALESCE(u.nick_name, u.email) AS author_handle,
			u.avatar AS author_avatar,
			COUNT(DISTINCT l.user_id) AS likes_count,
			COUNT(DISTINCT c.id) AS comments_count,
			EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) AS liked
		FROM posts p
		JOIN users u ON u.id = p.author_id
		LEFT JOIN likes l ON l.post_id = p.id
		LEFT JOIN comments c ON c.post_id = p.id
		WHERE p.author_id = ?
		AND (
			p.privacy = 'public'
			OR p.author_id = ?
			OR (p.privacy = 'almost_private' AND EXISTS(
				SELECT 1 FROM follows
				WHERE follower_id = ? AND following_id = p.author_id AND status = 'accepted'
			))
			OR (p.privacy = 'private' AND EXISTS(
				SELECT 1 FROM post_privacy_users
				WHERE post_id = p.id AND user_id = ?
			))
		)
		GROUP BY p.id, u.first_name, u.last_name, u.nick_name, u.email, u.avatar
		ORDER BY p.created_at DESC
	`, viewerID, authorID, viewerID, viewerID, viewerID).Scan(&posts).Error

	return posts, err
}

func (r *postRepository) GetComments(postID uuid.UUID) ([]model.CommentResponse, error) {
	var comments []model.CommentResponse

	err := r.db.Raw(`
		SELECT
			c.id, c.post_id, c.content, c.image, c.created_at,
			c.author_id,
			u.first_name || ' ' || u.last_name AS author_name,
			COALESCE(u.nick_name, u.email) AS author_handle,
			u.avatar AS author_avatar
		FROM comments c
		JOIN users u ON u.id = c.author_id
		WHERE c.post_id = ?
		ORDER BY c.created_at ASC
	`, postID).Scan(&comments).Error

	return comments, err
}

func (r *postRepository) AddComment(c *model.Comment) error {
	return r.db.Create(c).Error
}
