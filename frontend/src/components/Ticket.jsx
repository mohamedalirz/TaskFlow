import { useNavigate, useParams } from "react-router-dom";
import "../style/ProjectDetails.css";

function Ticket({ task, handleRemoveTask, handleMoveTask }) {
  const navigate = useNavigate();
  const { projectId } = useParams();

  return (
    <div
      className="ticket"
      onClick={() => navigate(`/projects/${projectId}/update-task/${task.id}`)}
    >
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <p>👤 {task.assignee || "Unassigned"}</p>
      <p>Status: {task.status}</p>

      <div
        className="ticket-actions"
        onClick={(e) => e.stopPropagation()} // prevent parent click
      >
        <button onClick={() => handleMoveTask(task.id, -1)}>⬅️</button>
        <button onClick={() => handleMoveTask(task.id, 1)}>➡️</button>
        <button onClick={() => handleRemoveTask(task.id)}>🗑️</button>
      </div>
    </div>
  );
}

export default Ticket;
