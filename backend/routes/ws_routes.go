package routes

import (
	"api/handler"
	"api/service"
	ws "api/websocket"

	"github.com/gin-gonic/gin"
)

func RegisterWsRoutes(r *gin.RouterGroup, hub *ws.Hub, groupService service.GroupService) {
	r.GET("/ws", handler.WsHandler(hub, groupService))
}