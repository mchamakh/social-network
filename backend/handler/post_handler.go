package handler

import (
	"net/http"

	"api/model"
	"api/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PostHandler struct {
	service service.PostService
}

func NewPostHandler(s service.PostService) *PostHandler {
	return &PostHandler{service: s}
}

type createPostInput struct {
	Content      string            `json:"content"`
	Image        *string           `json:"image,omitempty"`
	Privacy      model.PostPrivacy `json:"privacy" binding:"required"`
	AllowedUsers []uuid.UUID       `json:"allowed_users,omitempty"`
}

func (h *PostHandler) CreatePost(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	var input createPostInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Content == "" && input.Image == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content or image is required"})
		return
	}

	post, err := h.service.CreatePost(userID, input.Content, input.Image, input.Privacy, input.AllowedUsers)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": post})
}

func (h *PostHandler) GetFeed(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	posts, err := h.service.GetFeed(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": posts})
}

func (h *PostHandler) GetUserPosts(c *gin.Context) {
	viewerID := c.MustGet("user_id").(uuid.UUID)
	authorID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	posts, err := h.service.GetByAuthor(authorID, viewerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": posts})
}

func (h *PostHandler) DeletePost(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	postID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
		return
	}

	if err := h.service.DeletePost(postID, userID); err != nil {
		if err.Error() == "forbidden" {
			c.JSON(http.StatusForbidden, gin.H{"error": "not your post"})
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *PostHandler) ToggleLike(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	postID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
		return
	}

	liked, err := h.service.ToggleLike(postID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"liked": liked})
}

func (h *PostHandler) GetComments(c *gin.Context) {
	postID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
		return
	}

	comments, err := h.service.GetComments(postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": comments})
}

type addCommentInput struct {
	Content string  `json:"content"`
	Image   *string `json:"image,omitempty"`
}

func (h *PostHandler) AddComment(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	postID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
		return
	}

	var input addCommentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Content == "" && input.Image == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content or image is required"})
		return
	}

	comment, err := h.service.AddComment(postID, userID, input.Content, input.Image)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": comment})
}
