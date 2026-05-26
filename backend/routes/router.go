package routes

import (
	"api/container"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func NewRouter(c *container.Container) *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

    api := r.Group("/api")

	RegisterUserRoutes(api, c.UserHandler)
	RegisterAuthRoutes(api, c.AuthHandler)
	RegisterPostRoutes(api, c.PostHandler)
	RegisterWsRoutes(api, c.WsHub)

    return r
}