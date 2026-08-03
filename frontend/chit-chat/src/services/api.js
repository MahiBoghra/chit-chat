// BASE_URL routes through our Vite proxy to http://localhost:2000
const BASE_URL = "/api";

// Reads the logged-in user's id from localStorage
function getUserId() {
  return localStorage.getItem("user_id");
}

// ---------- AUTH ----------

// Send login request to backend
export async function loginUser(email, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    // Normalize response for the frontend
    if (res.ok && data.success && data.user) {
      return { success: true, user: data.user };
    }
    return { success: false, message: data.message || "Login failed" };
  } catch (error) {
    return { success: false, message: "Network connection error" };
  }
}

// Send signup request to backend
export async function signupUser({ username, email, password }) {
  try {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, user: data.user };
    }
    return { success: false, message: data.message || "Signup failed" };
  } catch (error) {
    return { success: false, message: "Network connection error" };
  }
}

// ---------- USER LISTING (DISCOVERY) ----------

// Get all other users in the system to start a conversation with
export async function getUsersList() {
  try {
    const userId = getUserId();
    if (!userId) return { success: false, message: "User not logged in" };
    const res = await fetch(`${BASE_URL}/auth/users?exclude_id=${userId}`);
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, data: data.users };
    }
    return { success: false, message: data.message || "Could not retrieve user list" };
  } catch (error) {
    return { success: false, message: "Network connection error" };
  }
}

// ---------- CONVERSATIONS ----------

// Get all conversations for the logged-in user
export async function getConversations() {
  try {
    const userId = getUserId();
    if (!userId) return { success: false, message: "User not logged in" };
    const res = await fetch(`${BASE_URL}/conversations/${userId}`);
    const data = await res.json();
    if (res.ok && data.success) {
      // Backend returns { success: true, conversations: [...] }
      // Map 'conversationId' -> 'id' to stay consistent with frontend components
      const mappedConversations = data.conversations.map(c => ({
        id: c.conversationId,
        username: c.username,
        updatedAt: c.updatedAt,
        lastMessage: "Click to start chatting",
        time: c.updatedAt ? new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""
      }));
      return { success: true, data: mappedConversations };
    }
    return { success: false, message: data.message || "Could not load conversations" };
  } catch (error) {
    return { success: false, message: "Network connection error" };
  }
}

// Create a new conversation with a user
export async function createConversation(receiverId) {
  try {
    const senderId = Number(getUserId());
    const res = await fetch(`${BASE_URL}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId, receiverId: Number(receiverId) }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, data: { id: data.conversation.id } };
    }
    return { success: false, message: data.message || "Failed to create conversation" };
  } catch (error) {
    return { success: false, message: "Network connection error" };
  }
}

// ---------- MESSAGES ----------

// Get messages for a specific conversation
export async function getMessages(conversationId) {
  try {
    const res = await fetch(`${BASE_URL}/messages/${conversationId}`);
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, data: data.data };
    }
    return { success: false, message: data.message || "Could not retrieve messages" };
  } catch (error) {
    return { success: false, message: "Network connection error" };
  }
}

// Send a new message
export async function sendMessage(conversationId, text) {
  try {
    const senderId = Number(getUserId());
    const res = await fetch(`${BASE_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: Number(conversationId),
        senderId,
        text,
      }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, data: data.data };
    }
    return { success: false, message: data.message || "Failed to send message" };
  } catch (error) {
    return { success: false, message: "Network connection error" };
  }
}
