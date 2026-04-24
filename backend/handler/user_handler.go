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

func NewUserHandler(service service.UserService) *UserHandler {
	return &UserHandler{service: service}
}

func (h *UserHandler) Create(c *gin.Context) {
	var user model.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "invalid JSON payload"})
		return
	}
	var validate = validator.New()

	if err := validate.Struct(user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "validation error"})
		return
	}
	if err := h.service.Create(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"status": "success", "error": "user created"})

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
	email := c.Param("email")

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
