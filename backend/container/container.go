package container

import (
	"api/handler"
	"api/repository"
	"api/service"
	ws "api/websocket"

	"gorm.io/gorm"
)

type Container struct {
	UserHandler         *handler.UserHandler
	AuthHandler         *handler.AuthHandler
	FollowHandler       *handler.FollowHandler
	PostHandler         *handler.PostHandler
	GroupHandler        *handler.GroupHandler
	MessageHandler      *handler.MessageHandler
	NotificationHandler *handler.NotificationHandler
	GroupService        service.GroupService
	WsHub               *ws.Hub
}

func NewContainer(db *gorm.DB) *Container {
	userRepo    := repository.NewUserRepository(db)
	refreshRepo := repository.NewRefreshTokenRepository(db)
	followRepo  := repository.NewFollowRepository(db)
	postRepo    := repository.NewPostRepository(db)
	groupRepo   := repository.NewGroupRepository(db)
	msgRepo     := repository.NewMessageRepository(db)
	notifRepo   := repository.NewNotificationRepository(db)

	hub := ws.NewHub()
	go hub.Run()

	userService    := service.NewUserService(userRepo)
	authService    := service.NewAuthService(userService, refreshRepo)
	followService  := service.NewFollowService(followRepo, userRepo)
	postService    := service.NewPostService(postRepo, hub)
	groupService   := service.NewGroupService(groupRepo)
	msgService     := service.NewMessageService(msgRepo, followRepo, hub)
	notifService   := service.NewNotificationService(notifRepo, hub)

	userHandler    := handler.NewUserHandler(userService, followService)
	authHandler    := handler.NewAuthHandler(authService)
	followHandler  := handler.NewFollowHandler(followService, notifService)
	postHandler    := handler.NewPostHandler(postService)
	groupHandler   := handler.NewGroupHandler(groupService, notifService)
	msgHandler     := handler.NewMessageHandler(msgService)
	notifHandler   := handler.NewNotificationHandler(notifService)

	return &Container{
		UserHandler:         userHandler,
		AuthHandler:         authHandler,
		FollowHandler:       followHandler,
		PostHandler:         postHandler,
		GroupHandler:        groupHandler,
		MessageHandler:      msgHandler,
		NotificationHandler: notifHandler,
		GroupService:        groupService,
		WsHub:               hub,
	}
}
