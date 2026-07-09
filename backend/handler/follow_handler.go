package handler

import (
	"fmt"
	"net/http"

	"api/model"
	"api/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type FollowHandler struct {
	service      service.FollowService
	notifService service.NotificationService
}

func NewFollowHandler(s service.FollowService, n service.NotificationService) *FollowHandler {
	return &FollowHandler{service: s, notifService: n}
}

func (h *FollowHandler) FollowUser(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	targetID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	follow, err := h.service.FollowUser(userID, targetID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if follow.Status == model.Pending {
		_ = h.notifService.Notify(
			targetID,
			model.NotifFollowRequest,
			&userID,
			&follow.ID,
			fmt.Sprintf("Someone sent you a follow request"),
		)
	}

	c.JSON(http.StatusOK, gin.H{"status": string(follow.Status)})
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
	userID := c.MustGet("user_id").(uuid.UUID)
	followID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid follow id"})
		return
	}

	if err := h.service.AcceptFollow(followID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

func (h *FollowHandler) RejectFollow(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	followID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid follow id"})
		return
	}

	if err := h.service.RejectFollow(followID, userID); err != nil {
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

	c.JSON(http.StatusOK, gin.H{"data": data})
}

func (h *FollowHandler) GetFollowers(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	targetID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	canView, err := h.service.CanViewProfile(userID, targetID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	if !canView {
		c.JSON(http.StatusForbidden, gin.H{"error": "this account is private"})
		return
	}

	users, err := h.service.GetFollowers(targetID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"data": users})
}

func (h *FollowHandler) GetFollowing(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	targetID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	canView, err := h.service.CanViewProfile(userID, targetID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	if !canView {
		c.JSON(http.StatusForbidden, gin.H{"error": "this account is private"})
		return
	}

	users, err := h.service.GetFollowing(targetID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"data": users})
}

func (h *FollowHandler) GetFollowStatus(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	targetID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	status, err := h.service.GetFollowStatus(userID, targetID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": status})
}
