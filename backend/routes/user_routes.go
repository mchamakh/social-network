package routes

import (
	"api/handler"

	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(r *gin.RouterGroup, userHandler *handler.UserHandler) {
	users := r.Group("/users")

	users.GET("", userHandler.GetAll)
	users.GET("/:id", userHandler.GetByID)
	users.GET("/email", userHandler.GetByEmail)
	users.DELETE("/:id", userHandler.Delete)
}
