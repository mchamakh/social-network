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
	users.GET("/:id/followers", h.GetFollowers)
	users.GET("/:id/following", h.GetFollowing)
	users.GET("/:id/follow-status", h.GetFollowStatus)
	users.GET("/follow/pending", h.GetPending)
	users.POST("/follow/:id/accept", h.AcceptFollow)
	users.DELETE("/follow/:id/reject", h.RejectFollow)
}
