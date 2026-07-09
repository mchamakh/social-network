package handler

import (
	"fmt"
	"net/http"
	"time"

	"api/model"
	"api/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type GroupHandler struct {
	service      service.GroupService
	notifService service.NotificationService
}

func NewGroupHandler(s service.GroupService, n service.NotificationService) *GroupHandler {
	return &GroupHandler{service: s, notifService: n}
}

func (h *GroupHandler) ListGroups(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	items, err := h.service.ListGroups(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}

func (h *GroupHandler) CreateGroup(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	var input struct {
		Title       string  `json:"title" binding:"required"`
		Description *string `json:"description,omitempty"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	g, err := h.service.CreateGroup(userID, input.Title, input.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": g})
}

func (h *GroupHandler) GetGroup(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	groupID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid group id"})
		return
	}
	detail, err := h.service.GetGroupDetail(groupID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": detail})
}

func (h *GroupHandler) RequestJoin(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	groupID, _ := uuid.Parse(c.Param("id"))
	creatorID, err := h.service.RequestJoin(groupID, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	_ = h.notifService.Notify(
		creatorID,
		model.NotifGroupJoinRequest,
		&userID,
		&groupID,
		fmt.Sprintf("Someone wants to join your group"),
	)
	c.Status(http.StatusOK)
}

func (h *GroupHandler) InviteUser(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	groupID, _ := uuid.Parse(c.Param("id"))
	targetID, err := uuid.Parse(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	if err := h.service.InviteUser(groupID, userID, targetID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	_ = h.notifService.Notify(
		targetID,
		model.NotifGroupInvitation,
		&userID,
		&groupID,
		fmt.Sprintf("You have been invited to join a group"),
	)
	c.Status(http.StatusOK)
}

func (h *GroupHandler) AcceptRequest(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	groupID, _ := uuid.Parse(c.Param("id"))
	targetID, _ := uuid.Parse(c.Param("userId"))
	if err := h.service.AcceptRequest(groupID, userID, targetID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (h *GroupHandler) DeclineRequest(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	groupID, _ := uuid.Parse(c.Param("id"))
	targetID, _ := uuid.Parse(c.Param("userId"))
	if err := h.service.DeclineRequest(groupID, userID, targetID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (h *GroupHandler) AcceptInvitation(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	groupID, _ := uuid.Parse(c.Param("id"))
	if err := h.service.AcceptInvitation(groupID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (h *GroupHandler) DeclineInvitation(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	groupID, _ := uuid.Parse(c.Param("id"))
	if err := h.service.DeclineInvitation(groupID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (h *GroupHandler) GetPendingRequests(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	groupID, _ := uuid.Parse(c.Param("id"))
	members, err := h.service.GetPendingRequests(groupID, userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": members})
}

func (h *GroupHandler) GetPosts(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	groupID, _ := uuid.Parse(c.Param("id"))
	posts, err := h.service.GetPosts(groupID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": posts})
}

func (h *GroupHandler) CreatePost(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	groupID, _ := uuid.Parse(c.Param("id"))
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
	p, err := h.service.CreatePost(groupID, userID, input.Content, input.Image)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": p})
}

func (h *GroupHandler) TogglePostLike(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	postID, _ := uuid.Parse(c.Param("postId"))
	liked, err := h.service.TogglePostLike(postID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"liked": liked})
}

func (h *GroupHandler) GetPostComments(c *gin.Context) {
	postID, _ := uuid.Parse(c.Param("postId"))
	comments, err := h.service.GetPostComments(postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": comments})
}

func (h *GroupHandler) AddPostComment(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	postID, _ := uuid.Parse(c.Param("postId"))
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
	comment, err := h.service.AddPostComment(postID, userID, input.Content, input.Image)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": comment})
}

func (h *GroupHandler) GetEvents(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	groupID, _ := uuid.Parse(c.Param("id"))
	events, err := h.service.GetEvents(groupID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": events})
}

func (h *GroupHandler) CreateEvent(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	groupID, _ := uuid.Parse(c.Param("id"))
	var input struct {
		Title       string  `json:"title" binding:"required"`
		Description *string `json:"description,omitempty"`
		EventTime   string  `json:"event_time" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	t, err := time.Parse(time.RFC3339, input.EventTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event_time format, use RFC3339"})
		return
	}
	event, memberIDs, err := h.service.CreateEvent(groupID, userID, input.Title, input.Description, t)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	for _, memberID := range memberIDs {
		if memberID == userID {
			continue
		}
		mid := memberID
		eid := event.ID
		_ = h.notifService.Notify(
			mid,
			model.NotifGroupEvent,
			&userID,
			&eid,
			fmt.Sprintf("A new event has been created in a group you're in: %s", event.Title),
		)
	}
	c.JSON(http.StatusCreated, gin.H{"data": event})
}

func (h *GroupHandler) RespondToEvent(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	eventID, _ := uuid.Parse(c.Param("eventId"))
	var input struct {
		Response string `json:"response" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.service.RespondToEvent(eventID, userID, input.Response); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}
