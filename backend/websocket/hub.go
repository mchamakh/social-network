package websocket

type Hub struct {
	Clients    map[string]*Client
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan Message
}

func NewHub() *Hub {
	return &Hub{
		Clients:    make(map[string]*Client),
		Register:   make(chan *Client, 256),
		Unregister: make(chan *Client, 256),
		Broadcast:  make(chan Message, 256),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Clients[client.UserID] = client

		case client := <-h.Unregister:
			if _, ok := h.Clients[client.UserID]; ok {
				delete(h.Clients, client.UserID)
				close(client.Send)
			}

		case message := <-h.Broadcast:
			h.routeMessage(message)
		}
	}
}

func (h *Hub) routeMessage(message Message) {
	switch message.Type {

	case MessageTypeChatPrivate, MessageTypeNotification:
		if message.TargetID == nil {
			return
		}
		if targetClient, ok := h.Clients[*message.TargetID]; ok {
			select {
			case targetClient.Send <- message:
			default:
				delete(h.Clients, targetClient.UserID)
				close(targetClient.Send)
			}
		}

	case MessageTypeChatGroup:
		if message.GroupID == nil {
			return
		}
		groupIDStr := *message.GroupID
		for _, client := range h.Clients {
			if h.clientInGroup(client, groupIDStr) {
				select {
				case client.Send <- message:
				default:
					delete(h.Clients, client.UserID)
					close(client.Send)
				}
			}
		}

	case MessageTypeTyping:
		if message.TargetID == nil {
			return
		}
		if targetClient, ok := h.Clients[*message.TargetID]; ok {
			select {
			case targetClient.Send <- message:
			default:
			}
		}

	case MessageTypeFeedUpdate:
		for _, client := range h.Clients {
			select {
			case client.Send <- message:
			default:
				delete(h.Clients, client.UserID)
				close(client.Send)
			}
		}
	}
}

func (h *Hub) clientInGroup(client *Client, groupID string) bool {
	for _, id := range client.Groups {
		if id == groupID {
			return true
		}
	}
	return false
}