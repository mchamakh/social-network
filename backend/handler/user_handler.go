package handler

import (
	"api/dto"
	"api/service"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserHandler struct {
	service       service.UserService
	followService service.FollowService
}

type CreateUserInput struct {
	FirstName string `json:"first_name" validate:"required,min=2"`
	LastName  string `json:"last_name" validate:"required,min=2"`
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=6"`
	Birthday  string `json:"birthday" validate:"required"`

	NickName *string `json:"nickname,omitempty" validate:"omitempty,min=2"`
	Avatar   *string `json:"avatar,omitempty" validate:"omitempty,url"`
	AboutMe  *string `json:"about_me,omitempty" validate:"omitempty,max=200"`
}

func NewUserHandler(service service.UserService, followService service.FollowService) *UserHandler {
	return &UserHandler{service: service, followService: followService}
}

func (h *UserHandler) GetAll(c *gin.Context) {
	users, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "error": "failed to fetch users"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "data": users})
}

func (h *UserHandler) GetByEmail(c *gin.Context) {
	email := c.Query("email")

	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": "email is required"})
		return
	}
	user, err := h.service.GetByEmail(email)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "data": user})
}

func (h *UserHandler) GetByID(c *gin.Context) {
	viewerID := c.MustGet("user_id").(uuid.UUID)

	idParam := c.Param("id")
	if idParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": "missing user id"})
		return
	}
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": "invalid uuid format"})
		return
	}
	user, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "error": "user not found"})
		return
	}

	canView, err := h.followService.CanViewProfile(viewerID, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "error": err.Error()})
		return
	}
	if !canView {
		// Private account and the viewer isn't an accepted follower: only
		// expose the identity fields needed to render a follow button.
		user.Email = ""
		user.Birthday = ""
		user.AboutMe = nil
		user.Banner = nil
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": user})
}

func (h *UserHandler) GetMe(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	user, err := h.service.GetByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "data": user})
}

func (h *UserHandler) UpdateMe(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	var input dto.UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": "invalid JSON"})
		return
	}

	user, err := h.service.UpdateProfile(userID, input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "data": user})
}

func (h *UserHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	if idParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": "missing id"})
		return
	}
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "error": "invalid uuid format"})
		return
	}
	if err := h.service.Delete(id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"status": "error", "error": "user not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "error": "failed to delete the user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "user deleted"})
}
