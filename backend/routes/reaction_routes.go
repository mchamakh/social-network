package routes

import (
	"api/handler"
	"api/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterReactionRoutes(r *gin.RouterGroup, reactionHandler *handler.ReactionHandler) {
	reactions := r.Group("/posts/:post_id/reactions")
	reactions.Use(middleware.AuthMiddleware())

	reactions.POST("", reactionHandler.Toggle)
	reactions.DELETE("", reactionHandler.Remove)
	reactions.GET("", reactionHandler.GetSummary)
}
