import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NavSide from "./NavSide";
import axios from "axios";
import "../style/Dashboard.css";

export default function UpdateTask() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState({
    title: "",
    description: "",
    assignee: "",
    columnId: 1,
  });

  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  if (!token) navigate("/login");

  const fetchTask = async () => {
    try {
      const res = await axios.get(`http://localhost:3737/tasks/api/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTask(res.data);
    } catch (err) {
      console.error("Failed to fetch task:", err.response?.data || err);
      alert(`Failed to load task: ${err.response?.data?.message || err.message}`);
      navigate(`/projects/${projectId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:3737/tasks/api/${taskId}`,
        {
          title: task.title,
          description: task.description,
          assignee: task.assignee,
          columnId: task.columnId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Task updated successfully!");
      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error("Failed to update task:", err.response?.data || err);
      alert(`Failed to update task: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) return <div className="layout"><NavSide /><main className="content">Loading task...</main></div>;

  return (
    <div className="layout">
      <NavSide />
      <main className="content">
        <div className="top-card">
          <div>
            <h1>Update Task</h1>
            <p>Edit task details for project #{projectId}</p>
          </div>
          <button className="add-btn" onClick={() => navigate(`/projects/${projectId}`)}>Cancel</button>
        </div>

        <section className="new-project-form">
          <div className="form-card">
            <label>Task Title</label>
            <input
              type="text"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
            />

            <label>Description</label>
            <textarea
              value={task.description}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
            />

            <label>Assignee</label>
            <input
              type="text"
              value={task.assignee}
              onChange={(e) => setTask({ ...task, assignee: e.target.value })}
              placeholder="Assign a username"
            />

            <label>Status</label>
            <select
              value={task.columnId}
              onChange={(e) => setTask({ ...task, columnId: parseInt(e.target.value) })}
            >
              <option value={1}>To Do</option>
              <option value={2}>In Progress</option>
              <option value={3}>Done</option>
            </select>

            <button className="create-btn" onClick={handleUpdate}>Update Task</button>
          </div>
        </section>
      </main>
    </div>
  );
}
