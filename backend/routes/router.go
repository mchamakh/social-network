package routes

import (
	"api/container"

	"github.com/gin-gonic/gin"
)

type Handlers struct {
}

func NewRouter(c *container.Container) *gin.Engine {
	r := gin.Default()

	api := r.Group("/api")

	RegisterUserRoutes(api, c.UserHandler)

	return r
}
