const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

// Create task
const createTask = async (req, res) => {
    try {
        const { title, projectId, colomnId, assignee, description } = req.body;
        console.log(colomnId);
        
        if (!title || !projectId) return res.status(400).json({ message: "Missing data" });

        // Find project
        const project = await Project.findOne({ id: Number(projectId) });
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Check authorization (owner check by name)
        const user = await User.findOne({ id: req.user.id });
        if (!user) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Generate task ID (string in your model)
        const lastTask = await Task.findOne().sort({ id: -1 });
        let newId = "1";
        if (lastTask && lastTask.id) {
            newId = (parseInt(lastTask.id) + 1).toString();
        }

        // Create task
        const task = new Task({
            id: newId,
            title,
            description: description || "",
            assignee: assignee || "none",
            projectId: Number(projectId),
            colomnId: parseInt(colomnId) || 0 // Note: typo in model field name
        });

        await task.save();
        res.status(201).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get tasks by project
const getTasksByProject = async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        const project = await Project.findOne({ id: projectId });
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Check authorization
        const user = await User.findOne({ id: req.user.id });
        if (!user) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const projectTasks = await Task.find({ projectId: projectId });
        res.json(projectTasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


// Get single task by ID
const getTaskById = async (req, res) => {
    try {
        const taskId = req.params.id; // String in your model
        
        // Find task by string ID
        const task = await Task.findOne({ id: taskId });
        if (!task) return res.status(404).json({ message: "Task not found" });

        const project = await Project.findOne({ id: task.projectId });
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Check authorization
        const user = await User.findOne({ id: req.user.id });
        if (!user || project.ownerId !== user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update task
const updateTask = async (req, res) => {
    try {
        const taskId = req.params.id; // String in your model
        const { title, description, assignee, columnId } = req.body;

        // Find task
        const task = await Task.findOne({ id: taskId });
        if (!task) return res.status(404).json({ message: "Task not found" });

        const project = await Project.findOne({ id: task.projectId });
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Check authorization
        const user = await User.findOne({ id: req.user.id });
        if (!user) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Update task fields
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (assignee !== undefined) task.assignee = assignee;
        if (columnId !== undefined) task.colomnId = columnId; // Note: typo in model field name

        await task.save();
        res.json({ message: "Task updated", task });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete task
const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id; // String in your model
        
        // Find task
        const task = await Task.findOne({ id: taskId });
        if (!task) return res.status(404).json({ message: "Task not found" });

        const project = await Project.findOne({ id: task.projectId });
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Check authorization
        const user = await User.findOne({ id: req.user.id });
        if (!user) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Task.deleteOne({ id: taskId });
        res.json({ message: "Task deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    createTask,
    getTasksByProject,
    getTaskById,
    updateTask,
    deleteTask
};