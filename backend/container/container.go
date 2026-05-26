package container

import (
	"api/handler"
	"api/repository"
	"api/service"
	ws "api/websocket"

	"gorm.io/gorm"
)

type Container struct {
	UserHandler    *handler.UserHandler
	AuthHandler    *handler.AuthHandler
	PostHandler    *handler.PostHandler
	CommentHandler *handler.CommentHandler
	WsHub          *ws.Hub
}

func NewContainer(db *gorm.DB) *Container {
	userRepo := repository.NewUserRepository(db)
	refreshRepo := repository.NewRefreshTokenRepository(db)
	postRepo := repository.NewPostRepository(db)
	commentRepo := repository.NewCommentRepository(db)

	userService := service.NewUserService(userRepo)
	authService := service.NewAuthService(userService, refreshRepo)
	postService := service.NewPostService(postRepo)
	commentService := service.NewCommentService(commentRepo)

	userHandler := handler.NewUserHandler(userService)
	authHandler := handler.NewAuthHandler(authService)
	postHandler := handler.NewPostHandler(postService)
	commentHandler := handler.NewCommentHandler(commentService)

	hub := ws.NewHub()
	go hub.Run()

	return &Container{
		UserHandler:    userHandler,
		AuthHandler:    authHandler,
		PostHandler:    postHandler,
		CommentHandler: commentHandler,
		WsHub:          hub,
	}
}