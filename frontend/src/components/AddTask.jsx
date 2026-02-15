import { useNavigate, useParams } from "react-router-dom";
import NavSide from "./NavSide";
import { useState, useEffect } from "react";
import axios from "axios";
import "../style/AddTask.css";

export default function AddTask() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [colomnId, setColomnId] = useState(0);
  const [members, setMembers] = useState([])

  const token = localStorage.getItem("token");

  const getColomnId = () => {return colomnId}

useEffect(()=>{
  const fetchMemebers = async () => {
    try {
      const res = await axios.get(`http://localhost:3737/projects/api/${projectId}`,
      {
        headers: { Authorization: `Bearer ${token}` }, // Include token
      })  
      
      if (res.data.success) setMembers(res.data.data)
    } catch (error)
    {
       console.error('Error fetching members:', error);
    }
  }

  fetchMemebers()
}, [projectId, token])

  
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
      colomnId: getColomnId(),
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
            <select value={assignee} onChange={e => {
              const newVal = e.target.value
              setAssignee(newVal)
              }}>
              <option value="">Select member</option>
              {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>

            <label>Status</label>
            <select value={colomnId} onChange={e => {
              const newVal = e.target.value
              setColomnId(newVal)
              }}> 
              <option value= {0}>To Do</option>
              <option value= {1}>In Progress</option>
              <option value= {2}>Done</option>
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
