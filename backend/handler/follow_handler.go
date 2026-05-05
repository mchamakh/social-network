package handler

import (
	"net/http"

	"api/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type FollowHandler struct {
	service service.FollowService
}

func NewFollowHandler(s service.FollowService) *FollowHandler {
	return &FollowHandler{s}
}

func (h *FollowHandler) FollowUser(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	targetID, _ := uuid.Parse(c.Param("id"))

	err := h.service.FollowUser(userID, targetID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

func (h *FollowHandler) UnfollowUser(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	targetID, _ := uuid.Parse(c.Param("id"))

	err := h.service.UnfollowUser(userID, targetID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

func (h *FollowHandler) AcceptFollow(c *gin.Context) {
	followID, _ := uuid.Parse(c.Param("id"))

	err := h.service.AcceptFollow(followID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

func (h *FollowHandler) RejectFollow(c *gin.Context) {
	followID, _ := uuid.Parse(c.Param("id"))

	err := h.service.RejectFollow(followID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

func (h *FollowHandler) GetPending(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	data, err := h.service.GetPendingRequests(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, data)
}
