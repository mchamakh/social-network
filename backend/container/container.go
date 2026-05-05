package container

import (
	"api/handler"
	"api/repository"
	"api/service"

	"gorm.io/gorm"
)

type Container struct {
	UserHandler   *handler.UserHandler
	AuthHandler   *handler.AuthHandler
	FollowHandler *handler.FollowHandler
}

func NewContainer(db *gorm.DB) *Container {
	userRepo := repository.NewUserRepository(db)
	refreshRepo := repository.NewRefreshTokenRepository(db)
	followRepo := repository.NewFollowRepository(db)

	userService := service.NewUserService(userRepo)
	authService := service.NewAuthService(userService, refreshRepo)
	followService := service.NewFollowService(followRepo, userRepo)

	userHandler := handler.NewUserHandler(userService)
	authHandler := handler.NewAuthHandler(authService)
	followHandler := handler.NewFollowHandler(followService)

	return &Container{
		UserHandler:   userHandler,
		AuthHandler:   authHandler,
		FollowHandler: followHandler,
	}
}
