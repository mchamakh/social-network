package websocket

import "time"

const (
    MessageTypeChatPrivate  = "chat_private"
    MessageTypeChatGroup    = "chat_group"
    MessageTypeNotification = "notification"
    MessageTypeTyping       = "typing"
    MessageTypeFeedUpdate   = "feed_update"
)

type Message struct {
    Type      string    `json:"type"`
    SenderID  string    `json:"sender_id"`
    TargetID  *string   `json:"target_id,omitempty"`
    GroupID   *string   `json:"group_id,omitempty"`
    Payload   string    `json:"payload"`
    CreatedAt time.Time `json:"created_at"`
}