import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await loginUser(email.trim(), password);
    setLoading(false);

    if (result.success) {
      // Backend returns user details inside result.user. Storing ID and Username.
      localStorage.setItem("user_id", result.user.id);
      localStorage.setItem("username", result.user.username);
      navigate("/chat");
    } else {
      setError(result.message || "Invalid email or password");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-glow-blob auth-glow-1"></div>
      <div className="auth-glow-blob auth-glow-2"></div>
      <div className="auth-card">
        <div className="auth-brand">
          <div className="logo-icon">💬</div>
          <h2>Chit-chat</h2>
          <p>Connect instantly with friends</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="yourname@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-alert">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login to Chat"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/signup">Create one now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
