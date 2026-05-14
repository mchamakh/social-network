package routes

import (
	"api/handler"

	"github.com/gin-gonic/gin"
)

func FollowRoutes(r *gin.RouterGroup, h *handler.FollowHandler) {
	r.POST("/users/:id/follow", h.FollowUser)
	r.DELETE("/users/:id/follow", h.UnfollowUser)

	r.GET("/me/follow-requests", h.GetPending)
	r.POST("/follow/:id/accept", h.AcceptFollow)
	r.POST("/follow/:id/reject", h.RejectFollow)
}
