import "../style/Dashboard.css";
import { useNavigate } from "react-router-dom";
import NavSide from "./NavSide";
import { useState, useEffect, useCallback } from "react";
import ProjectCard from "./ProjectCard";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Fetch logged-in user
  const fetchUser = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get("http://localhost:3737/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      return res.data; // Return user data for chaining
    } catch (err) {
      console.error("Error fetching user:", err);
      navigate("/login");
      return null;
    }
  }, [token, navigate]);

  // Fetch user's projects
  const fetchProjects = useCallback(async (userId) => {
    if (!token || !userId) return;
    
    try {
      const res = await axios.get("http://localhost:3737/projects/api", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter projects where user is owner OR member
      console.log(res.data);
      
      const userProjects = res.data
      setProjects(userProjects);
      
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  }, [token, user]);

  // Fetch user's invitations
  const fetchInvitations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:3737/invitations/api", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvitations(res.data);      
    } catch (err) {
      console.error("Error fetching invitations:", err);
    }
  }, [token]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    try {
      const userData = await fetchUser();
      if (userData) {
        await Promise.all([
          fetchProjects(userData.id),
          fetchInvitations()
        ]);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      setLoading(true);
    } finally {
      setLoading(false);
    }
  }, [fetchUser, fetchProjects, fetchInvitations]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleAccept = async (invId) => {
    if (!token) return;
    
    try {
      const res = await axios.post(
        `http://localhost:3737/invitations/api/${invId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Invitation accepted:", res.data);
      alert("Invitation accepted!");
      
      // Refresh all data
      await refreshData();
      
    } catch (err) {
      console.error(err.response?.data || err);
      alert(`Failed to accept invitation: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDecline = async (invId) => {
    if (!token) return;
    
    try {
      const res = await axios.post(
        `http://localhost:3737/invitations/api/${invId}/decline`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Invitation declined:", res.data);
      alert("Invitation declined.");
      
      // Refresh invitations only
      await fetchInvitations();
      
    } catch (err) {
      console.error(err.response?.data || err);
      alert(`Failed to decline invitation: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="layout">
        <NavSide />
        <main className="content">
          <div className="top-card">
            <div>
              <h1>Dashboard</h1>
              <p>Loading...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="layout">
      <NavSide/>
      <main className="content">
        <div className="top-card">
          <div>
            <h1>Dashboard</h1>
            {user && (
              <p>Welcome back, {user.name || user.username || "User"} 👋</p>
            )}
          </div>
          <button 
            className="add-btn" 
            onClick={() => navigate("/new-project")}
          >
            ＋ New Project
          </button>
        </div>

        <section>
          <div className="section-head">
            <h3>My Projects</h3>
            <span className="count">{projects.length}</span>
          </div>

          <div className="cards">
            {projects.length > 0 ? (
              projects.map((project) => (
                <ProjectCard 
                  project={project} 
                  owner = {project.ownerName}
                  refreshProjects={() => fetchProjects(user?.id)} 
                />
              ))
            ) : (
              <div className="empty-state">
                <p>No projects yet. Create one to get started!</p>
                <button 
                  className="create-btn"
                  onClick={() => navigate("/new-project")}
                >
                  Create Your First Project
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="invite">
          <h3>Pending Invitations</h3>
          {invitations.length === 0 ? (
            <div className="empty-box">
              📭
              <p>No pending invitations</p>
            </div>
          ) : (
            <div className="invitation-list">
              {invitations
                .filter(inv => inv.status === "pending")
                .map((inv) => (
                  <div key={inv.id} className="invitation-card">
                    <p>
                      <strong>{inv.projectOwner}</strong> invited you to join{" "}
                      <strong>{inv.projectName}</strong>
                    </p>
                    <div className="invitation-actions">
                      <button 
                        className="accept-btn" 
                        onClick={() => handleAccept(inv.id)}
                      >
                        Accept
                      </button>
                      <button 
                        className="decline-btn" 
                        onClick={() => handleDecline(inv.id)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}