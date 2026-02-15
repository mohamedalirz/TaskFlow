const jwt = require("jsonwebtoken");
const Project = require("../models/Project");
const User = require("../models/User");

const JWT_SECRET = "your_jwt_secret_key";

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; // { id, email}
        next();
    });
};



// Get all projects for the user
const getAllProjects = async (req, res) => {
    try {
        // Get user info
        const user = await User.findOne({ id: req.user.id });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Find projects where user is owner OR member
        const projectsWhereOwner = await Project.find({ ownerId: user.id });
        const projectsWhereMember = await Project.find({ membersListId: user.id });
        
        // Combine and remove duplicates (if user is both owner and member)
        const allProjects = [...projectsWhereOwner, ...projectsWhereMember];
        
        // Remove duplicates by project ID
        const uniqueProjects = Array.from(
            new Map(allProjects.map(p => [p.id, p])).values()
        );
        
        // Get all unique owner IDs
        const ownerIds = [...new Set(uniqueProjects.map(p => p.ownerId).filter(Boolean))];
        
        // Fetch all owners in one query
        const owners = await User.find({ id: { $in: ownerIds } });
        const ownerMap = new Map(owners.map(o => [o.id, o.name]));
        
        // Add owner names to projects
        const projectsWithOwnerNames = uniqueProjects.map(project => {
            const projectObj = project.toObject ? project.toObject() : project;
            return {
                ...projectObj,
                ownerName : ownerMap.get(project.ownerId) || "Unknown"
            };
        });
        console.log(projectsWithOwnerNames);
        
        res.json(projectsWithOwnerNames);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Create project
const createProject = async (req, res) => {
    try {
        const { name, description, color } = req.body;
        if (!name) return res.status(400).json({ message: "Project name required" });

        // Get user info
        const user = await User.findOne({ id: req.user.id });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate project ID
        const lastProject = await Project.findOne().sort({ id: -1 });
        const newId = lastProject ? lastProject.id + 1 : 1;

        // Create project
        const newProject = new Project({
            id: newId,
            name,
            description: description || "",
            ownerId: user.id, // Your model stores owner as string
            membersListId: [user.id],
            color: color || "red"
        });
        
        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete project
const deleteProject = async (req, res) => {
    try {
        const projectId = Number(req.params.id);
        
        // Find project by custom id field
        const project = await Project.findOne({ id: projectId });
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Check if user is owner (comparing by name since owner is string)
        const user = await User.findOne({ id: req.user.id });
        if (!user || project.ownerId !== user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Project.deleteOne({ id: projectId });
        
        // Delete associated tasks
        const Task = require("../models/Task");
        await Task.deleteMany({ projectId: projectId });
        
        res.json({ message: "Project deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const getUserName = async (id) => {
    const user = await User.findOne({ id: id })
    return user ? user.name : null
}

const getProjectMembers = async (req, res) => {
    try {
        const projectId = Number(req.params.id)
        const project = await Project.findOne({ id: projectId });
        if (!project) return res.status(404).json({ success : false, message: "Project not found" });
        const membersListId = project.membersListId

        if (!membersListId) return res.status(404).json({success : false, message : "There is no members"})
        const memebersListName = await Promise.all(
            membersListId.map(async (id) => {
                try {
                    const userName = await getUserName(id)
                    return {
                        id : id,
                        name : userName
                    }
                } catch (error) {
                    return {
                        id : id,
                        name : ""
                    }
                }
            })
        )
        const validMembers = memebersListName.filter(member => member.name !== null);        
        return res.status(200).json({
            success : true,
            data : validMembers,
            projectId : projectId
        });

    } catch (error){
        console.error(error);
        return res.status(500).json({ success : false, message: "Server error" });   
    }
}
module.exports = {
    getAllProjects,
    createProject,
    deleteProject,
    getProjectMembers,
    authenticateToken
};