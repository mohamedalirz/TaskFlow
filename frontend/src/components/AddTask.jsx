import { useNavigate, useParams } from "react-router-dom";
import NavSide from "./NavSide";
import { useState } from "react";
import axios from "axios";
import "../style/AddTask.css";

export default function AddTask() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [colomnId, setColomnId] = useState(1);

  const members = ["Dali", "Alice", "Bob", "Admin"];

  const token = localStorage.getItem("token");

  
const handleTaskAdd = async () => {
  if (!token) {
    alert("You must be logged in");
    navigate("/login");
    return;
  }

  try {
    const newTask = {
      title,
      description,
      assignee,
      colomnId,
      projectId: Number(projectId),
    };

    const res = await axios.post(
      "http://localhost:3737/tasks/api",
      newTask,
      {
        headers: {
          Authorization: `Bearer ${token}` // ✅ important!
        }
      }
    );

    console.log("Task created:", res.data);

    // Go back to project page
    navigate(`/projects/${projectId}`);
  } catch (error) {
    console.error("Error creating task:", error.response?.data || error);
    alert(`Failed to create task: ${error.response?.data?.message || "Unknown error"}`);
  }
};

  return (
    <div className="layout">
      <NavSide />
      <main className="content">
        <div className="top-card">
          <div>
            <h1>Add New Task</h1>
            <p>Create a task for project #{projectId}</p>
          </div>
          <button className="add-btn" onClick={() => navigate(`/projects/${projectId}`)}>
            Cancel
          </button>
        </div>

        <section className="new-project-form">
          <div className="form-card">
            <label>Task Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter task title"
            />

            <label>Task Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter task description"
            />

            <label>Assignee</label>
            <select value={assignee} onChange={e => setAssignee(e.target.value)}>
              <option value="">Select member</option>
              {members.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <label>Status</label>
            <select value={colomnId} onChange={e => setColomnId(parseInt(e.target.value))}>
              <option value={1}>To Do</option>
              <option value={2}>In Progress</option>
              <option value={3}>Done</option>
            </select>

            <button className="create-btn" onClick={handleTaskAdd}>
              Create Task
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
