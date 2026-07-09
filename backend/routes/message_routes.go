package routes

import (
	"api/handler"

	"github.com/gin-gonic/gin"
)

func RegisterMessageRoutes(r *gin.RouterGroup, h *handler.MessageHandler, auth gin.HandlerFunc) {
	msgs := r.Group("/messages")
	msgs.Use(auth)

	msgs.GET("/conversations", h.GetConversations)
	msgs.GET("/:userId", h.GetHistory)
	msgs.POST("/:userId", h.SendMessage)
}
