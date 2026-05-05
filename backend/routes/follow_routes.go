package routes

import (
	"api/handler"

	"github.com/gin-gonic/gin"
)

func RegisterFollowRoutes(r *gin.RouterGroup, h *handler.FollowHandler, auth gin.HandlerFunc) {
	users := r.Group("/users")
	users.Use(auth)

	users.POST("/:id/follow", h.FollowUser)
	users.DELETE("/:id/follow", h.UnfollowUser)
}
