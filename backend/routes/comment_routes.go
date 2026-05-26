package routes

import (
	"api/handler"
	"api/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterCommentRoutes(r *gin.RouterGroup, commentHandler *handler.CommentHandler) {
	comments := r.Group("/posts/:post_id/comments")
	comments.Use(middleware.AuthMiddleware())

	comments.POST("", commentHandler.Create)
	comments.GET("", commentHandler.GetByPost)
	comments.DELETE("/:id", commentHandler.Delete)
}
