function ChatHeader({ conversation }) {
  const initial = conversation.username ? conversation.username.charAt(0).toUpperCase() : "?";

  return (
    <div className="chat-header">
      <div className="avatar-container-header">
        {conversation.avatar ? (
          <img src={conversation.avatar} alt="" className="avatar-header-img" />
        ) : (
          <div className="avatar-placeholder-header">{initial}</div>
        )}
      </div>
      <div className="header-info">
        <span className="header-username">{conversation.username}</span>
        <span className="header-status">online</span>
      </div>
    </div>
  );
}

export default ChatHeader;
