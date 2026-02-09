import { useNavigate } from "react-router-dom";
import "../style/Dashboard.css";
import NavSide from "./NavSide";
import { useState, useEffect } from "react";
import ProjectCard from "./ProjectCard";
import axios from "axios";

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:3737/projects/api");
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="layout">
      <NavSide />

      <main className="content">
        <div className="top-card projects-top">
          <h1>Projects</h1>
          <p>Here you can see all your projects</p>
        </div>

        <section>
          <div className="section-head">
            <h3>All Projects</h3>
            <span className="count">{projects.length}</span>
          </div>

          <div className="cards">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          <button className="create-btn" onClick={() => navigate("/new-project")}>
            + New Project
          </button>
        </section>
      </main>
    </div>
  );
}

export default Projects;
