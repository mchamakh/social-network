package handler

import (
	"log"
	"net/http"

	ws "api/websocket"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

func WsHandler(hub *ws.Hub) gin.HandlerFunc {
    return func(c *gin.Context) {
        // On utilise "user_id" — exactement comme dans ton middleware
        // et on cast en string car c'est ce que ton middleware stocke
        userIDVal, exists := c.Get("user_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "non autorisé"})
            return
        }
        userID := userIDVal.(string)

        groups := []int{}

        conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
        if err != nil {
            log.Printf("erreur upgrade websocket: %v", err)
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