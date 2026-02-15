import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/AuthPage.css";
import axios from "axios"; 

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");  // Keep as username for UI
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
    
    if (!username.trim() || !email.trim() || !password.trim()) {
      alert("Please fill in all fields");
      return;
    }
    
    try {
      console.log("Sending registration request...");
      console.log("Request data:", { 
        name: username, 
        email, 
        password 
      });
      
      const response = await axios.post("http://localhost:3737/auth/register", { 
        name: username,  
        email, 
        password 
      });
      
      console.log("✅ Registration successful:", response.data);
      alert("Registration successful! Please log in.");
      setIsLogin(true);
      // Clear form
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      
    } catch(err) {
      console.error("❌ Registration failed - FULL ERROR:", err);
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error headers:", err.response?.headers);
      console.error("Error config:", err.config);
      
      // Show detailed error in alert
      let errorMessage = "Registration failed: ";
      
      if (err.response) {
        // Server responded with error
        errorMessage += `Server error (${err.response.status}): `;
        errorMessage += err.response.data?.message || JSON.stringify(err.response.data);
      } else if (err.request) {
        // Request made but no response
        errorMessage += "No response from server. Check if backend is running.";
      } else {
        // Something else
        errorMessage += err.message;
      }
      
      alert(errorMessage);
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
                Don't have an account?
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