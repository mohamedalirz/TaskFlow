import { useNavigate, useParams } from "react-router-dom";
import NavSide from "./NavSide";
import "../style/Invite.css";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Invite() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // Logged-in username
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Fetch logged-in user info to get username
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:3737/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsername(res.data.username); // store logged-in username
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch user info:", err.response?.data || err);
        alert("Failed to get your user info. Please login again.");
        navigate("/login");
      });
  }, [token, navigate]);

  const handleSend = () => {
    if (!token) {
      alert("You must be logged in to send invites");
      navigate("/login");
      return;
    }
    if (!username) {
      alert("Your user info is not loaded yet. Try again in a moment.");
      return;
    }
    if (!email) {
      alert("Please enter an email address.");
      return;
    }

    // Send the invite with the sender username
    axios
      .post(
        "http://localhost:3737/invitations/api",
        { email, projectId: Number(projectId), sendFrom: username },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        console.log("Invite sent:", res.data);
        alert("Invite sent successfully!");
        navigate(`/projects/${projectId}`);
      })
      .catch((err) => {
        console.error("Failed to send invite:", err.response?.data || err);
        alert(`Failed to send invite: ${err.response?.data?.message || err.message}`);
      });
  };

  if (loading) {
    return (
      <div className="layout">
        <NavSide />
        <div className="invite-page-content">
          <div className="invite-box">
            <h2>Invite Someone</h2>
            <p>Loading user info...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <NavSide />

      <div className="invite-page-content">
        <div className="invite-box">
          <h2>Invite Someone</h2>
          <p>Project ID: {projectId}</p>

          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            className="invite-send-btn"
            onClick={handleSend}
            disabled={!email || !username}
          >
            Send Invite
          </button>

          <button className="invite-cancel-btn" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
