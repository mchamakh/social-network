package container

import (
	"api/handler"
	"api/repository"
	"api/service"
	ws "api/websocket"

	"gorm.io/gorm"
)

type Container struct {
    UserHandler *handler.UserHandler
    AuthHandler *handler.AuthHandler
    WsHub       *ws.Hub
}

func NewContainer(db *gorm.DB) *Container {
    userRepo := repository.NewUserRepository(db)
    refreshRepo := repository.NewRefreshTokenRepository(db)

    userService := service.NewUserService(userRepo)
    authService := service.NewAuthService(userService, refreshRepo)

    userHandler := handler.NewUserHandler(userService)
    authHandler := handler.NewAuthHandler(authService)

    hub := ws.NewHub()
    go hub.Run()

    return &Container{
        UserHandler: userHandler,
        AuthHandler: authHandler,
        WsHub:       hub,
    }
}