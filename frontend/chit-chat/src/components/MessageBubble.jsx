function MessageBubble({ message }) {
  const currentUserId = localStorage.getItem("user_id");
  // Defensive checks support both camelCase (Drizzle Javascript models) and snake_case keys
  const isMine = String(message.senderId || message.sender_id) === String(currentUserId);

  const rawTime = message.createdAt || message.created_at;
  const timeString = rawTime
    ? new Date(rawTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className={`message-bubble-wrapper ${isMine ? "mine" : "theirs"}`}>
      <div className="message-bubble">
        <p className="message-text">{message.text}</p>
        <span className="message-time">{timeString}</span>
      </div>
    </div>
  );
}

export default MessageBubble;
