import { useState } from "react";

function MessageInput({ onSend }) {
  const [text, setText] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <form className="message-input-form" onSubmit={handleSend}>
      <input
        className="message-input-field"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        maxLength={2000}
      />
      <button type="submit" className="btn-send" disabled={!text.trim()}>
        Send
      </button>
    </form>
  );
}

export default MessageInput;
