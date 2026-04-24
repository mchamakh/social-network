package handler

import (
	"api/model"
	"api/service"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserHandler struct {
	service service.UserService
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

func NewUserHandler(service service.UserService) *UserHandler {
	return &UserHandler{service: service}
}

func (h *UserHandler) Create(c *gin.Context) {
	var input CreateUserInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "invalid JSON payload"})
		return
	}
	var validate = validator.New()

	if err := validate.Struct(input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "validation error"})
		return
	}

	user := model.User{
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Email:     input.Email,
		Password:  input.Password,
		Birthday:  input.Birthday,
		NickName:  input.NickName,
		Avatar:    input.Avatar,
		AboutMe:   input.AboutMe,
	}
	if err := h.service.Create(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"status": "success", "message": "user created"})

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
