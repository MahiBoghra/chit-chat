// Path: frontend\chit-chat\src\App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import socket from "./services/socket"; // Import the socket instance
import { useEffect } from "react";


// Guard helper component to protect paths
function ProtectedRoute({ children }) {
  const userId = localStorage.getItem("user_id");
  return userId ? children : <Navigate to="/" />;
}

function App() {


  
useEffect(() => {
    socket.on("connect", () => {
        console.log("Connected!");
        console.log("Socket ID:", socket.id);
    });

    return () => {
        socket.off("connect");
    };
}, []);


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        {/* Fallback route redirection */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
