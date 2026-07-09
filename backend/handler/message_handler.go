package handler

import (
	"net/http"

	"api/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MessageHandler struct {
	service service.MessageService
}

func NewMessageHandler(s service.MessageService) *MessageHandler {
	return &MessageHandler{service: s}
}

func (h *MessageHandler) GetConversations(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	convs, err := h.service.GetConversations(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": convs})
}

func (h *MessageHandler) GetHistory(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	otherID, err := uuid.Parse(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	msgs, err := h.service.GetPrivateHistory(userID, otherID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": msgs})
}

func (h *MessageHandler) SendMessage(c *gin.Context) {
	senderID := c.MustGet("user_id").(uuid.UUID)
	receiverID, err := uuid.Parse(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	var input struct {
		Content string  `json:"content"`
		Image   *string `json:"image,omitempty"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Content == "" && input.Image == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content or image is required"})
		return
	}
	msg, err := h.service.SendPrivate(senderID, receiverID, input.Content, input.Image)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": msg})
}

func (h *MessageHandler) GetGroupHistory(c *gin.Context) {
	groupID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid group id"})
		return
	}
	msgs, err := h.service.GetGroupHistory(groupID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": msgs})
}

func (h *MessageHandler) SendGroupMessage(c *gin.Context) {
	authorID := c.MustGet("user_id").(uuid.UUID)
	groupID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid group id"})
		return
	}
	var input struct {
		Content string  `json:"content"`
		Image   *string `json:"image,omitempty"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Content == "" && input.Image == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content or image is required"})
		return
	}
	msg, err := h.service.SendGroupMessage(groupID, authorID, input.Content, input.Image)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": msg})
}
