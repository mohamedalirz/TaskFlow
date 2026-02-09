import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/AuthPage.css";
import axios from "axios"; 

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  // Handle user login
  const handleLogin = async () => {
    try{
      const res = await axios.post("http://localhost:3737/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    }
    catch(err){
      console.error("Login failed:", err);
      alert(`Login failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Handle user registration
  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const res = await axios.post("http://localhost:3737/auth/register", { username, email, password });
      alert("Registration successful! Please log in.");
      setIsLogin(true);
    }catch(err){
      console.error("Registration failed:", err);
      alert(`Registration failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="brand">
          <span className="emojie">🚀</span>
          <h1>TaskFlow</h1>
          <p>Manage your projects with ease</p>

          <ul>
            <li>✔ Collaborative project management</li>
            <li>✔ Powerful Kanban boards</li>
            <li>✔ Real-time team collaboration</li>
          </ul>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          {isLogin ? (
            <>
              <h2>Welcome Back</h2>
              <p className="subtitle">Sign in to continue to TaskFlow</p>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button onClick={handleLogin}>Login</button>

              <p className="switch">
                Don’t have an account?
                <span onClick={() => setIsLogin(false)}> Sign up</span>
              </p>
            </>
          ) : (
            <>
              <h2>Create Account</h2>
              <p className="subtitle">
                Join TaskFlow and start organizing your projects
              </p>

              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button onClick={handleRegister}>Sign Up</button>

              <p className="switch">
                Already have an account?
                <span onClick={() => setIsLogin(true)}> Login</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
