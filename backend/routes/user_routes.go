package routes

import (
	"api/handler"

	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(r *gin.RouterGroup, userHandler *handler.UserHandler, auth gin.HandlerFunc) {
	users := r.Group("/users")

	users.GET("", userHandler.GetAll)
	users.GET("/email", userHandler.GetByEmail)
	users.DELETE("/:id", userHandler.Delete)

	protected := users.Group("")
	protected.Use(auth)
	protected.GET("/me", userHandler.GetMe)
	protected.PUT("/me", userHandler.UpdateMe)
	protected.GET("/:id", userHandler.GetByID)
}
