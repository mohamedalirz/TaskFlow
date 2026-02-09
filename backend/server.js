const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "your_jwt_secret_key";

// ------------------- STORAGE -------------------
let users = [];
let projects = [];
let tasks = [];
let invitations = [];

// ------------------- AUTH MIDDLEWARE -------------------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // { id, email }
    next();
  });
};

// ------------------- AUTH ROUTES -------------------

// Register
app.post("/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "Missing fields" });

  if (users.find(u => u.email === email))
    return res.status(409).json({ message: "User exists" });

  const hashed = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now(), username, email, password: hashed };
  users.push(newUser);

  const token = jwt.sign({ id: newUser.id, email }, JWT_SECRET, { expiresIn: "1h" });
  res.status(201).json({ token });
});

// Login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Get logged-in user info
app.get("/auth/me", authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ id: user.id, username: user.username, email: user.email });
});

// ------------------- PROJECT ROUTES -------------------

// Get all projects (for filtering on frontend)
app.get("/projects/api", authenticateToken, (req, res) => {
  res.json(projects);
});

// Create project
app.post("/projects/api", authenticateToken, (req, res) => {
  const { name, description, color } = req.body;
  if (!name) return res.status(400).json({ message: "Project name required" });

  const newProject = {
    id: Date.now(),
    name: req.body.name,
    description: req.body.description,
    color: req.body.color || "blue",
    userId: req.user.id,
    owner: req.user.username,
    members: [],            
    membersListId: [],      
  };
  projects.push(newProject);
  res.status(201).json(newProject);

});

// Delete project
app.delete("/projects/api/:id", authenticateToken, (req, res) => {
  const projectId = Number(req.params.id);
  const index = projects.findIndex(p => p.id === projectId && p.userId === req.user.id);
  if (index === -1) return res.status(404).json({ message: "Project not found" });

  projects.splice(index, 1);
  tasks = tasks.filter(t => t.projectId !== projectId);
  res.json({ message: "Project deleted" });
});

// ------------------- TASK ROUTES -------------------

// ===================== TASK ROUTES =====================

// Create task
app.post("/tasks/api", authenticateToken, (req, res) => {
  const { title, projectId, columnId, assignee, description } = req.body;
  if (!title || !projectId) return res.status(400).json({ message: "Missing data" });

  const project = projects.find(p => p.id === Number(projectId));
  if (!project) return res.status(404).json({ message: "Project not found" });

  // Only owner or member can add tasks
  project.membersListId = project.membersListId || [];
  if (project.userId !== req.user.id && !project.membersListId.includes(req.user.id))
    return res.status(403).json({ message: "Not authorized" });

  const task = {
    id: Date.now(),
    title,
    description: description || "",
    assignee: assignee || "",
    projectId: project.id,
    columnId: columnId || 1, // default To Do
    status: columnId === 2 ? "In Progress" : columnId === 3 ? "Done" : "To Do",
  };

  tasks.push(task);
  res.status(201).json(task);
});

// Get tasks by project
app.get("/projects/api/:id/tasks", authenticateToken, (req, res) => {
  const projectId = Number(req.params.id);
  const project = projects.find(p => p.id === projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  project.membersListId = project.membersListId || [];
  if (project.userId !== req.user.id && !project.membersListId.includes(req.user.id))
    return res.status(403).json({ message: "Not authorized" });

  const projectTasks = tasks.filter(t => t.projectId === projectId);
  res.json(projectTasks);
});

// Get single task by ID
app.get("/tasks/api/:id", authenticateToken, (req, res) => {
  const taskId = Number(req.params.id);
  const task = tasks.find(t => t.id === taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });

  const project = projects.find(p => p.id === task.projectId);
  project.membersListId = project.membersListId || [];
  if (project.userId !== req.user.id && !project.membersListId.includes(req.user.id))
    return res.status(403).json({ message: "Not authorized" });

  res.json(task);
});

// Update task
app.put("/tasks/api/:id", authenticateToken, (req, res) => {
  const taskId = Number(req.params.id);
  const { title, description, assignee, columnId } = req.body;

  const task = tasks.find(t => t.id === taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });

  const project = projects.find(p => p.id === task.projectId);
  project.membersListId = project.membersListId || [];
  if (project.userId !== req.user.id && !project.membersListId.includes(req.user.id))
    return res.status(403).json({ message: "Not authorized" });

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (assignee !== undefined) task.assignee = assignee;

  if (columnId !== undefined) {
    task.columnId = columnId;
    task.status = columnId === 2 ? "In Progress" : columnId === 3 ? "Done" : "To Do";
  }

  res.json({ message: "Task updated", task });
});

// Delete task
app.delete("/tasks/api/:id", authenticateToken, (req, res) => {
  const taskId = Number(req.params.id);
  const index = tasks.findIndex(t => t.id === taskId);
  if (index === -1) return res.status(404).json({ message: "Task not found" });

  const project = projects.find(p => p.id === tasks[index].projectId);
  project.membersListId = project.membersListId || [];
  if (project.userId !== req.user.id && !project.membersListId.includes(req.user.id))
    return res.status(403).json({ message: "Not authorized" });

  tasks.splice(index, 1);
  res.json({ message: "Task deleted" });
});

// ------------------- INVITATION ROUTES -------------------

// Invite a user to a project
app.post("/invitations/api", authenticateToken, (req, res) => {
  const { projectId, email } = req.body;
  const project = projects.find(p => p.id === Number(projectId));
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (project.userId !== req.user.id) return res.status(403).json({ message: "Only owner can invite" });

  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (project.membersListId.includes(user.id)) return res.status(409).json({ message: "Already a member" });

  const invitation = {
    id: Date.now(),
    projectId: project.id,
    projectName: project.name,
    fromUserId: req.user.id,
    fromUsername: users.find(u => u.id === req.user.id).username,
    email,
    status: "pending",
  };

  invitations.push(invitation);
  res.status(201).json({ message: "Invitation sent" });
});

// Get invitations for logged-in user
app.get("/invitations/api", authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  const userInvitations = invitations.filter(inv => inv.email === user.email && inv.status === "pending");
  res.json(userInvitations);
});

// Accept invitation
app.post("/invitations/api/:id/accept", authenticateToken, (req, res) => {
  const invitationId = Number(req.params.id);
  const invitation = invitations.find(inv => inv.id === invitationId);
  if (!invitation) return res.status(404).json({ message: "Invitation not found" });

  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (invitation.email !== user.email)
    return res.status(403).json({ message: "Not authorized to accept this invitation" });

  const project = projects.find(p => p.id === invitation.projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  // Add user ID to membersListId if not already there
  if (!project.membersListId.includes(user.id)) {
    project.membersListId.push(user.id);
  }

  // Also optionally keep username in members array for display
  if (!project.members.includes(user.username)) {
    project.members.push(user.username);
  }

  invitation.status = "accepted";

  res.json({ message: "Invitation accepted", project });
});


// Decline invitation
app.post("/invitations/api/:id/decline", authenticateToken, (req, res) => {
  const invitationId = Number(req.params.id);
  const invitation = invitations.find(inv => inv.id === invitationId);
  if (!invitation) return res.status(404).json({ message: "Invitation not found" });

  const user = users.find(u => u.id === req.user.id);
  if (invitation.email !== user.email) return res.status(403).json({ message: "Not authorized" });

  invitation.status = "declined";
  res.json({ message: "Invitation declined" });
});

// ------------------- START SERVER -------------------
app.listen(3737, () => console.log("Server running on http://localhost:3737"));
