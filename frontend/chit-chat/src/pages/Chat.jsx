import { useState, useEffect, useRef } from "react";
import { getConversations, getMessages, sendMessage, createConversation } from "../services/api";
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessagesList from "../components/MessagesList";
import MessageInput from "../components/MessageInput";

function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  // Keep a mutable ref of the selected conversation so that the interval loop
  // always polls the active chat.
  const selectedConvRef = useRef(selectedConversation);
  useEffect(() => {
    selectedConvRef.current = selectedConversation;
  }, [selectedConversation]);

  // Load conversations once when the component mounts
  useEffect(() => {
    loadConversations();
  }, []);

  // Poll for messages in the active conversation every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const activeConv = selectedConvRef.current;
      if (activeConv) {
        const result = await getMessages(activeConv.id);
        if (result.success) {
          setMessages(result.data);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    setLoadingConversations(true);
    const result = await getConversations();
    if (result.success) {
      setConversations(result.data);
    }
    setLoadingConversations(false);
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]); // Clear immediately for visual feedback
    const result = await getMessages(conversation.id);
    if (result.success) {
      setMessages(result.data);
    }
  };

  const handleSendMessage = async (text) => {
    if (!selectedConversation) return;
    const result = await sendMessage(selectedConversation.id, text);
    if (result.success) {
      // snap-append the sent message to list immediately to ensure UI responsiveness
      setMessages((prev) => [...prev, result.data]);
    }
  };

  const handleStartNewChat = async (receiver) => {
    // 1. Check if a conversation with this user already exists locally
    const existing = conversations.find(c => c.username === receiver.username);
    if (existing) {
      handleSelectConversation(existing);
      return;
    }

    // 2. Otherwise trigger backend creation
    const result = await createConversation(receiver.id);
    if (result.success) {
      // Reload conversations list
      const convResult = await getConversations();
      if (convResult.success) {
        setConversations(convResult.data);
        const newConv = convResult.data.find(c => c.id === result.data.id);
        if (newConv) {
          handleSelectConversation(newConv);
        } else {
          // Fallback if rendering state is in transit
          handleSelectConversation({
            id: result.data.id,
            username: receiver.username,
            lastMessage: "Click to start chatting",
            time: ""
          });
        }
      }
    } else {
      alert(result.message || "Failed to start conversation.");
    }
  };

  return (
    <div className="chat-layout">
      <Sidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        onStartNewChat={handleStartNewChat}
        loading={loadingConversations}
      />

      <div className="chat-viewport">
        {selectedConversation ? (
          <>
            <ChatHeader conversation={selectedConversation} />
            <MessagesList messages={messages} />
            <MessageInput onSend={handleSendMessage} />
          </>
        ) : (
          <div className="chat-empty-state">
            <div className="empty-chat-icon">💬</div>
            <h3>Your Messages</h3>
            <p>Select a conversation or find someone new using the "New Chat" search dropdown.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
