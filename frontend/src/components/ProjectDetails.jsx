import { useNavigate, useParams } from "react-router-dom";
import NavSide from "./NavSide";
import Ticket from "./Ticket";
import { useState, useEffect } from "react";
import axios from "axios";
import "../style/ProjectDetails.css";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token"); // get token

  // Fetch tasks for this project
  const fetchTasks = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3737/projects/api/${projectId}/tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await axios.delete(`http://localhost:3737/tasks/api/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  const handleMoveTask = async (id, direction) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    let newCol = task.columnId + direction; // <-- use columnId
    if (newCol < 1) newCol = 1;
    if (newCol > 3) newCol = 3;

    try {
      await axios.put(
        `http://localhost:3737/tasks/api/${id}`,
        { columnId: newCol }, // <-- send correct key
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to move task");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  if (loading)
    return (
      <div className="layout">
        <NavSide />
        <main className="content">Loading tasks...</main>
      </div>
    );

  return (
    <div className="layout">
      <NavSide />

      <div className="project-details-content">
        <div className="top-card project-header">
          <h1>Project {projectId}</h1>

          <div className="header-actions">
            <button
              className="invite-btn"
              onClick={() => navigate(`/projects/${projectId}/invite`)}
            >
              📩 Invite
            </button>

            <button
              className="add-ticket-btn"
              onClick={() => navigate(`/projects/${projectId}/add-task`)}
            >
              ＋ Add Task
            </button>
          </div>
        </div>

        <div className="columns">
          <Column
            title="To Do"
            tasks={tasks}
            colId={1}
            handleRemoveTask={handleRemoveTask}
            handleMoveTask={handleMoveTask}
          />
          <Column
            title="In Progress"
            tasks={tasks}
            colId={2}
            handleRemoveTask={handleRemoveTask}
            handleMoveTask={handleMoveTask}
          />
          <Column
            title="Done"
            tasks={tasks}
            colId={3}
            handleRemoveTask={handleRemoveTask}
            handleMoveTask={handleMoveTask}
          />
        </div>
      </div>
    </div>
  );
}

function Column({ title, tasks, colId, handleRemoveTask, handleMoveTask }) {
  return (
    <div className="column">
      <h3>{title}</h3>
      <div className="tasks">
        {tasks
          .filter((t) => Number(t.columnId) === colId) // <-- use columnId
          .map((task) => (
            <Ticket
              key={task.id}
              task={task}
              handleRemoveTask={handleRemoveTask}
              handleMoveTask={handleMoveTask}
              
            />
          ))}
      </div>
    </div>
  );
}
