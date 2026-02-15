const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

router.get("/api", projectController.authenticateToken, projectController.getAllProjects);
router.get("/api/:id", projectController.authenticateToken, projectController.getProjectMembers)
router.post("/api", projectController.authenticateToken, projectController.createProject);
router.delete("/api/:id", projectController.authenticateToken, projectController.deleteProject);


module.exports = router;