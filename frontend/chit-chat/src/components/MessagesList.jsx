import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

function MessagesList({ messages }) {
  const messagesEndRef = useRef(null);

  // Auto scroll bottom hook
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="messages-list">
      {messages.length === 0 ? (
        <div className="messages-empty">
          <p>Say hello! Send a message to start the conversation.</p>
        </div>
      ) : (
        messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))
      )}
      {/* Anchor for scroll utility */}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessagesList;
