package handler

import (
	"api/model"
	"api/service"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostHandler struct {
	service service.PostService
}

type CreatePostInput struct {
	Content  string  `json:"content" validate:"required,min=1"`
	ImageURL *string `json:"image_url,omitempty"`
}

func NewPostHandler(service service.PostService) *PostHandler {
	return &PostHandler{service: service}
}

func (h *PostHandler) Create(c *gin.Context) {
	var input CreatePostInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": err.Error()})
		return
	}

	userIDStr, _ := c.Get("user_id")
	authorID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "error": "invalid user id"})
		return
	}

	post := &model.Post{
		AuthorID: authorID,
		Content:  input.Content,
		ImageURL: input.ImageURL,
	}

	if err := h.service.Create(post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"status": "success", "data": post})
}

func (h *PostHandler) GetAll(c *gin.Context) {
	posts, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "error": "failed to fetch posts"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "data": posts})
}

func (h *PostHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": "invalid post id"})
		return
	}
	post, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "error": "post not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "data": post})
}

func (h *PostHandler) GetByAuthor(c *gin.Context) {
	authorID, err := uuid.Parse(c.Param("author_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": "invalid author id"})
		return
	}
	posts, err := h.service.GetByAuthorID(authorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "error": "failed to fetch posts"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "data": posts})
}

func (h *PostHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": "invalid post id"})
		return
	}

	userIDStr, _ := c.Get("user_id")
	requesterID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "error": "invalid user id"})
		return
	}

	if err := h.service.Delete(id, requesterID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"status": "error", "error": "post not found"})
			return
		}
		if err.Error() == "forbidden" {
			c.JSON(http.StatusForbidden, gin.H{"status": "error", "error": "you can only delete your own posts"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "error": "failed to delete post"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "post deleted"})
}
