require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
//mongodb+srv://amine:amine@cluster0.cax9frz.mongodb.net/?appName=Cluster0
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});

// Import routes
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const invitationRoutes = require("./routes/invitationRoutes");

// Use routes
app.use("/", userRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/invitations", invitationRoutes);

const projectController = require("./controllers/projectController");
const taskController = require("./controllers/taskController");
app.get("/projects/api/:id/tasks", projectController.authenticateToken, taskController.getTasksByProject);

// Start server
const PORT = 3737;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));