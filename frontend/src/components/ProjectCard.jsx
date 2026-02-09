import "../style/Dashboard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ProjectCard({ project, refreshProjects }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Get token for auth

  const handleRemove = async (e) => {
    e.stopPropagation(); // Prevent parent div click

    if (!token) {
      alert("You must be logged in to remove a project");
      navigate("/login");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:3737/projects/api/${project.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }, // Include token
        }
      );

      alert("Project removed successfully");

      // Refresh projects from server
      if (refreshProjects) refreshProjects();
    } catch (error) {
      console.error("Error removing project:", error.response || error);
      alert(`Failed to remove project: ${error.response?.data?.message || error.message}`);
    }
  };

  // Safe defaults
  const members = project.members || [];
  const owner = project.owner || "Unknown";

  return (
    <div
      className={`card ${project.color || ""}`}
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <h4>{project.name || "Untitled Project"}</h4>
      <p>
        👥 {members.length} member{members.length !== 1 ? "s" : ""} · 👑 {owner}
      </p>
      <button className="remove-btn" onClick={handleRemove}>
        🗑️ Remove
      </button>
    </div>
  );
}

export default ProjectCard;
