package handler

import (
	"api/model"
	"api/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ReactionHandler struct {
	service service.ReactionService
}

type ToggleReactionInput struct {
	ReactionType string `json:"reaction_type" validate:"required,oneof=like dislike"`
}

func NewReactionHandler(service service.ReactionService) *ReactionHandler {
	return &ReactionHandler{service: service}
}

func (h *ReactionHandler) Toggle(c *gin.Context) {
	postID, err := uuid.Parse(c.Param("post_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": "invalid post id"})
		return
	}

	var input ToggleReactionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": err.Error()})
		return
	}

	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "error": "invalid user id"})
		return
	}

	if err := h.service.Toggle(userID, postID, model.ReactionType(input.ReactionType)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "reaction saved"})
}

func (h *ReactionHandler) Remove(c *gin.Context) {
	postID, err := uuid.Parse(c.Param("post_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": "invalid post id"})
		return
	}

	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "error": "invalid user id"})
		return
	}

	if err := h.service.Remove(userID, postID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "error": "failed to remove reaction"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "reaction removed"})
}

func (h *ReactionHandler) GetSummary(c *gin.Context) {
	postID, err := uuid.Parse(c.Param("post_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": "invalid post id"})
		return
	}

	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "error": "invalid user id"})
		return
	}

	summary, err := h.service.GetSummary(userID, postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "error": "failed to fetch reactions"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "data": summary})
}
