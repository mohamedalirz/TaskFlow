const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const projectController = require("../controllers/projectController");

router.post("/api", projectController.authenticateToken, taskController.createTask);
router.get("/api/:id", projectController.authenticateToken, taskController.getTaskById);
router.put("/api/:id", projectController.authenticateToken, taskController.updateTask);
router.delete("/api/:id", projectController.authenticateToken, taskController.deleteTask);

module.exports = router;