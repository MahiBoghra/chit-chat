function ConversationCard({ conversation, isActive, onClick }) {
  const initial = conversation.username ? conversation.username.charAt(0).toUpperCase() : "?";

  return (
    <div
      className={`conversation-card ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      <div className="avatar-container">
        {conversation.avatar ? (
          <img src={conversation.avatar} alt={conversation.username} className="avatar-img" />
        ) : (
          <div className="avatar-placeholder">{initial}</div>
        )}
        <span className="online-badge"></span>
      </div>
      <div className="card-info">
        <div className="card-header-row">
          <p className="name">{conversation.username}</p>
          <span className="time">{conversation.time}</span>
        </div>
        <p className="last-message">{conversation.lastMessage}</p>
      </div>
    </div>
  );
}

export default ConversationCard;
