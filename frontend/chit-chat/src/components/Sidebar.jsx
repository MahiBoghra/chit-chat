import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsersList } from "../services/api";
import ConversationCard from "./ConversationCard";

function Sidebar({ conversations, selectedConversation, onSelectConversation, onStartNewChat, loading }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [newUserSearch, setNewUserSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const navigate = useNavigate();
  const currentUsername = localStorage.getItem("username") || "Me";

  // Filter existing conversations based on sidebar search input
  const filteredConversations = conversations.filter((c) =>
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch registered users when opening the "New Chat" overlay
  const handleToggleNewChat = async () => {
    setShowNewChatDropdown(!showNewChatDropdown);
    if (!showNewChatDropdown) {
      setLoadingUsers(true);
      const result = await getUsersList();
      if (result.success) {
        setAllUsers(result.data);
      }
      setLoadingUsers(false);
    }
  };

  // Filter registered users inside "New Chat" search overlay
  const filteredUsers = allUsers.filter((u) =>
    u.username.toLowerCase().includes(newUserSearch.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="sidebar">
      {/* Sidebar Header with logged-in Profile and Logout action */}
      <div className="sidebar-header">
        <div className="user-profile">
          <div className="user-avatar-mini">
            {currentUsername.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="profile-name">{currentUsername}</span>
            <span className="status-indicator">online</span>
          </div>
        </div>
        <button className="btn-logout" title="Log out" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Searching current chats & New chat discovery toggle */}
      <div className="sidebar-search-container">
        <input
          className="search-box"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn-new-chat" onClick={handleToggleNewChat}>
          New Chat
        </button>
      </div>

      {/* Dropdown list of registered users for starting conversations */}
      {showNewChatDropdown && (
        <div className="new-chat-dropdown">
          <div className="dropdown-header">
            <h4>Start a Chat</h4>
            <button className="close-btn" onClick={() => setShowNewChatDropdown(false)}>×</button>
          </div>
          <input
            className="dropdown-search"
            placeholder="Search other users..."
            value={newUserSearch}
            onChange={(e) => setNewUserSearch(e.target.value)}
            autoFocus
          />
          <div className="dropdown-users-list">
            {loadingUsers ? (
              <div className="dropdown-loader">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="dropdown-empty">No other users registered</div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="dropdown-user-card"
                  onClick={() => {
                    onStartNewChat(user);
                    setShowNewChatDropdown(false);
                    setNewUserSearch("");
                  }}
                >
                  <div className="user-avatar-placeholder">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="dropdown-user-name">{user.username}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Conversations display area */}
      <div className="conversation-list">
        {loading ? (
          <div className="sidebar-loader">Loading conversations...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="sidebar-empty">
            {searchQuery ? "No matching chats" : "No chats yet. Click 'New Chat' to start!"}
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ConversationCard
              key={conv.id}
              conversation={conv}
              isActive={selectedConversation?.id === conv.id}
              onClick={() => onSelectConversation(conv)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;
