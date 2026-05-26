package routes

import (
	"api/handler"
	"api/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterPostRoutes(r *gin.RouterGroup, postHandler *handler.PostHandler) {
	posts := r.Group("/posts")
	posts.Use(middleware.AuthMiddleware())

	posts.POST("", postHandler.Create)
	posts.GET("", postHandler.GetAll)
	posts.GET("/:id", postHandler.GetByID)
	posts.GET("/author/:author_id", postHandler.GetByAuthor)
	posts.DELETE("/:id", postHandler.Delete)
}
