package routes

import (
	"api/handler"

	"github.com/gin-gonic/gin"
)

func RegisterNotificationRoutes(r *gin.RouterGroup, h *handler.NotificationHandler, auth gin.HandlerFunc) {
	notifs := r.Group("/notifications")
	notifs.Use(auth)

	notifs.GET("", h.GetNotifications)
	notifs.GET("/count", h.UnreadCount)
	notifs.POST("/read-all", h.MarkAllRead)
	notifs.POST("/:id/read", h.MarkRead)
}
