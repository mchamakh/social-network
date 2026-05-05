package routes

import (
	"api/handler"
	"api/middleware"
	ws "api/websocket"

	"github.com/gin-gonic/gin"
)

func RegisterWsRoutes(r *gin.RouterGroup, hub *ws.Hub) {
	r.GET("/ws", middleware.AuthMiddleware(), handler.WsHandler(hub))
}