package routes

import (
	"api/handler"

	"github.com/gin-gonic/gin"
)


func RegisterGroupRoutes(r *gin.RouterGroup, h *handler.GroupHandler, auth gin.HandlerFunc) {
	groups := r.Group("/groups")
	groups.Use(auth)

	groups.GET("", h.ListGroups)
	groups.POST("", h.CreateGroup)
	groups.GET("/:id", h.GetGroup)

	groups.POST("/:id/join", h.RequestJoin)
	groups.POST("/:id/invite/:userId", h.InviteUser)
	groups.POST("/:id/invitation/accept", h.AcceptInvitation)
	groups.DELETE("/:id/invitation/decline", h.DeclineInvitation)
	groups.GET("/:id/requests", h.GetPendingRequests)
	groups.POST("/:id/requests/:userId/accept", h.AcceptRequest)
	groups.DELETE("/:id/requests/:userId/decline", h.DeclineRequest)

	groups.GET("/:id/posts", h.GetPosts)
	groups.POST("/:id/posts", h.CreatePost)
	groups.POST("/:id/posts/:postId/like", h.TogglePostLike)
	groups.GET("/:id/posts/:postId/comments", h.GetPostComments)
	groups.POST("/:id/posts/:postId/comments", h.AddPostComment)

	groups.GET("/:id/events", h.GetEvents)
	groups.POST("/:id/events", h.CreateEvent)
	groups.POST("/:id/events/:eventId/respond", h.RespondToEvent)
}

func RegisterGroupMessageRoutes(r *gin.RouterGroup, h *handler.MessageHandler, auth gin.HandlerFunc) {
	r.GET("/groups/:id/messages", auth, h.GetGroupHistory)
	r.POST("/groups/:id/messages", auth, h.SendGroupMessage)
}
