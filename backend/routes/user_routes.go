package routes

import (
	"api/handler"

	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(r *gin.RouterGroup, h *handler.UserHandler) {
	users := r.Group("/users")

	users.POST("", h.Create)
	users.GET("", h.GetAll)
	users.GET("/:id", h.GetByID)
	users.GET("/email", h.GetByEmail)
	users.DELETE("/:id", h.Delete)
}
