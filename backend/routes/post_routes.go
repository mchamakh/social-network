package routes

import (
	"api/handler"

	"github.com/gin-gonic/gin"
)

func RegisterPostRoutes(r *gin.RouterGroup, h *handler.PostHandler, auth gin.HandlerFunc) {
	posts := r.Group("/posts")
	posts.Use(auth)

	posts.GET("/feed", h.GetFeed)
	posts.POST("", h.CreatePost)
	posts.DELETE("/:id", h.DeletePost)
	posts.POST("/:id/like", h.ToggleLike)
	posts.GET("/:id/comments", h.GetComments)
	posts.POST("/:id/comments", h.AddComment)

	// posts by a specific user
	r.GET("/users/:id/posts", auth, h.GetUserPosts)
}
