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

type CommentHandler struct {
	service service.CommentService
}

type CreateCommentInput struct {
	Content string `json:"content" validate:"required,min=1"`
}

func NewCommentHandler(service service.CommentService) *CommentHandler {
	return &CommentHandler{service: service}
}

func (h *CommentHandler) Create(c *gin.Context) {
	postID, err := uuid.Parse(c.Param("post_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": "invalid post id"})
		return
	}

	var input CreateCommentInput
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

	comment := &model.Comment{
		PostID:   postID,
		AuthorID: authorID,
		Content:  input.Content,
	}

	if err := h.service.Create(comment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"status": "success", "data": comment})
}

func (h *CommentHandler) GetByPost(c *gin.Context) {
	postID, err := uuid.Parse(c.Param("post_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": "invalid post id"})
		return
	}

	comments, err := h.service.GetByPostID(postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "error": "failed to fetch comments"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "data": comments})
}

func (h *CommentHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": "invalid comment id"})
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
			c.JSON(http.StatusNotFound, gin.H{"status": "error", "error": "comment not found"})
			return
		}
		if err.Error() == "forbidden" {
			c.JSON(http.StatusForbidden, gin.H{"status": "error", "error": "you can only delete your own comments"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "error": "failed to delete comment"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "comment deleted"})
}
