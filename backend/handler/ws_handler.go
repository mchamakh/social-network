package handler

import (
	"log"
	"net/http"

	"api/pkg"
	"api/service"
	ws "api/websocket"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func WsHandler(hub *ws.Hub, groupService service.GroupService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userID string

		// Try auth middleware context first, then fall back to query param token
		if val, exists := c.Get("user_id"); exists {
			userID = val.(uuid.UUID).String()
		} else {
			token := c.Query("token")
			if token == "" {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
				return
			}
			claims, err := pkg.ValidateAccessToken(token)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
				return
			}
			id, ok := claims["user_id"].(string)
			if !ok {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
				return
			}
			userID = id
		}

		var groups []string
		if uid, err := uuid.Parse(userID); err == nil {
			if groupIDs, err := groupService.GetUserGroupIDs(uid); err == nil {
				for _, gid := range groupIDs {
					groups = append(groups, gid.String())
				}
			}
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("websocket upgrade error: %v", err)
			return
		}

		client := &ws.Client{
			UserID: userID,
			Conn:   conn,
			Send:   make(chan ws.Message, 256),
			Groups: groups,
			Hub:    hub,
		}

		hub.Register <- client

		go client.WritePump()
		go client.ReadPump()
	}
}
