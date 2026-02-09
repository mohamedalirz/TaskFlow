import { useNavigate } from "react-router-dom";
import NavSide from "./NavSide";
import "../style/Dashboard.css";
import { useState, useEffect } from "react";
import axios from "axios";

export default function NewProject() {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [borderColor, setBorderColor] = useState("#ef4444");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
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
      console.error("Failed to fetch user:", err);
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleProjectAdd = async () => {
    if (!user) {
      alert("User not loaded yet!");
      return;
    }

    try {
      const newProject = {
        id: Date.now(),
        userId: user.id, // <-- add logged-in user ID here
        name: projectName,
        description: projectDescription,
        members: [],
        owner: user.username, // <-- set project owner to logged-in user
        color: borderColor,
        tasks: [],
      };

      const response = await axios.post(
        "http://localhost:3737/projects/api",
        newProject,
        {
          headers: { Authorization: `Bearer ${token}` }, // send token in headers
        }
      );

      console.log("Project created:", response.data);
      navigate("/dashboard"); // redirect to dashboard
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Check console.");
    }
  };

  return (
    <div className="layout">
      <NavSide />

      <main className="content">
        <div className="top-card">
          <div>
            <h1>Create New Project</h1>
            <p>Fill the details and create your project</p>
          </div>

          <button className="add-btn" onClick={() => navigate("/dashboard")}>
            Cancel
          </button>
        </div>

        <section className="new-project-form">
          <div
            className="form-card"
            style={{ borderLeft: `6px solid ${borderColor}` }}
          >
            <label>Project Name</label>
            <input
              type="text"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />

            <label>Project Description</label>
            <textarea
              placeholder="Enter project description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />

            <label>Choose Project Color</label>
            <div className="color-buttons">
              <button
                className={`color-btn red ${borderColor === "red" ? "selected" : ""}`}
                onClick={() => setBorderColor("red")}
              />
              <button
                className={`color-btn green ${borderColor === "green" ? "selected" : ""}`}
                onClick={() => setBorderColor("green")}
              />
              <button
                className={`color-btn blue ${borderColor === "blue" ? "selected" : ""}`}
                onClick={() => setBorderColor("blue")}
              />
              <button
                className={`color-btn yellow ${borderColor === "yellow" ? "selected" : ""}`}
                onClick={() => setBorderColor("yellow")}
              />
            </div>

            <button className="create-btn" onClick={handleProjectAdd}>
              Create Project
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
