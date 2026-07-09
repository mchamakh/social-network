package routes

import (
	"api/container"
	"api/handler"
	"api/middleware"

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

    r.Static("/uploads", "./uploads")

    api := r.Group("/api")

    RegisterUserRoutes(api, c.UserHandler, middleware.AuthMiddleware())
    RegisterAuthRoutes(api, c.AuthHandler)
    RegisterFollowRoutes(api, c.FollowHandler, middleware.AuthMiddleware())
    RegisterPostRoutes(api, c.PostHandler, middleware.AuthMiddleware())
    RegisterGroupRoutes(api, c.GroupHandler, middleware.AuthMiddleware())
    RegisterGroupMessageRoutes(api, c.MessageHandler, middleware.AuthMiddleware())
    RegisterMessageRoutes(api, c.MessageHandler, middleware.AuthMiddleware())
    RegisterNotificationRoutes(api, c.NotificationHandler, middleware.AuthMiddleware())
    RegisterWsRoutes(api, c.WsHub, c.GroupService)

    api.POST("/upload", middleware.AuthMiddleware(), handler.UploadImage)

    return r
}