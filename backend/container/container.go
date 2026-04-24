package container

import (
	"api/handler"
	"api/repository"
	"api/service"

	"gorm.io/gorm"
)

type Container struct {
	UserHandler *handler.UserHandler
}

func NewContainer(db *gorm.DB) *Container {
	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userService)

	return &Container{
		UserHandler: userHandler,
	}
}
