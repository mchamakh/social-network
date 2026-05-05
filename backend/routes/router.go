package routes

import (
	"api/container"

	"github.com/gin-gonic/gin"
)

func NewRouter(c *container.Container) *gin.Engine {
    r := gin.Default()

    api := r.Group("/api")

    RegisterUserRoutes(api, c.UserHandler)
    RegisterAuthRoutes(api, c.AuthHandler)
    RegisterWsRoutes(api, c.WsHub)

    return r
}