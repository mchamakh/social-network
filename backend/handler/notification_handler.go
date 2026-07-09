package handler

import (
	"net/http"

	"api/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type NotificationHandler struct {
	service service.NotificationService
}

func NewNotificationHandler(s service.NotificationService) *NotificationHandler {
	return &NotificationHandler{service: s}
}

func (h *NotificationHandler) GetNotifications(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	notifs, err := h.service.GetForUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	count, _ := h.service.UnreadCount(userID)
	c.JSON(http.StatusOK, gin.H{"data": notifs, "unread_count": count})
}

func (h *NotificationHandler) MarkRead(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	notifID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid notification id"})
		return
	}
	if err := h.service.MarkRead(notifID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (h *NotificationHandler) MarkAllRead(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	if err := h.service.MarkAllRead(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (h *NotificationHandler) UnreadCount(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	count, err := h.service.UnreadCount(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"count": count})
}
