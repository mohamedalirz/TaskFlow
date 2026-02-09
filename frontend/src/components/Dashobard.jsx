import "../style/Dashboard.css";
import { useNavigate } from "react-router-dom";
import NavSide from "./NavSide";
import { useState, useEffect } from "react";
import ProjectCard from "./ProjectCard";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [invitations, setInvitations] = useState([]);

  const token = localStorage.getItem("token");

  // Fetch logged-in user
  const fetchUser = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get("http://localhost:3737/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      navigate("/login");
    }
  };

  // Fetch user's projects
  const fetchProjects = async () => {
  try {
    const res = await axios.get("http://localhost:3737/projects/api", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Include projects where user is owner OR member (by ID)
    const userProjects = res.data.filter(
      (p) => p.userId === user.id || p.membersListId?.includes(user.id)
    );

    setProjects(userProjects);
  } catch (err) {
    console.error("Error fetching projects:", err);
  }
};

  const refreshProjects = async () => {
  if (!user) return;
  try {
    const res = await axios.get("http://localhost:3737/projects/api", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userProjects = res.data.filter(
      (p) => p.userId === user.id || p.members.includes(user.username)
    );
    setProjects(userProjects);
  } catch (err) {
    console.error("Error fetching projects:", err);
  }
};

  // Fetch user's invitations
  const fetchInvitations = async () => {
    try {
      const res = await axios.get("http://localhost:3737/invitations/api", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvitations(res.data);
    } catch (err) {
      console.error("Error fetching invitations:", err);
    }
  };

  // Load user first
  useEffect(() => {
    const loadData = async () => {
      await fetchUser();
    };
    loadData();
  }, []);

  // Once user is loaded, fetch projects and invitations
  useEffect(() => {
    if (user) {
      fetchProjects(user.id);
      fetchInvitations();
    }
  }, [user]);

  const handleAccept = (invId) => {
    axios.post(
      `http://localhost:3737/invitations/api/${invId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(res => {
      console.log("Invitation accepted:", res.data);
      alert("Invitation accepted!");
      refreshProjects();    // fetch projects again to include the new membership
      fetchInvitations();   // refresh invitations to remove accepted
    })
    .catch(err => {
      console.error(err.response?.data || err);
      alert(`Failed to accept invitation: ${err.response?.data?.message || err.message}`);
    });
  };

  const handleDecline = (invId) => {
    axios.post(
      `http://localhost:3737/invitations/api/${invId}/decline`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(res => {
      console.log("Invitation declined:", res.data);
      alert("Invitation declined.");
      fetchInvitations();  // refresh invitations to remove declined
    })
    .catch(err => {
      console.error(err.response?.data || err);
      alert(`Failed to decline invitation: ${err.response?.data?.message || err.message}`);
    });
  };


  return (
    <div className="layout">
      <NavSide />
      <main className="content">
        <div className="top-card">
          <div>
            <h1>Dashboard</h1>
            {user && <p>Welcome back, {user.username} 👋</p>}
          </div>
          <button className="add-btn" onClick={() => navigate("/new-project")}>
            ＋ New Project
          </button>
        </div>

        <section>
          <div className="section-head">
            <h3>My Projects</h3>
            <span className="count">{projects.length}</span>
          </div>

          <div className="cards">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} refreshProjects={refreshProjects} />
            ))}
            {projects.length === 0 && <p>No projects yet. Create one!</p>}
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
                .filter(inv => inv.status === "pending") // show only pending
                .map((inv) => (
                  <div key={inv.id} className="invitation-card">
                    <p>
                      <strong>{inv.fromUsername || "Someone"}</strong> invited you to join{" "}
                      <strong>{inv.projectName}</strong>
                    </p>
                    <div className="invitation-actions">
                      <button className="accept-btn" onClick={() => handleAccept(inv.id)}>Accept</button>
                      <button className="decline-btn" onClick={() => handleDecline(inv.id)}>Decline</button>
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