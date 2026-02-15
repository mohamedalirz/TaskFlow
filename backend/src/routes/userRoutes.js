const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const projectController = require("../controllers/projectController");

router.post("/auth/register", userController.register);
router.post("/auth/login", userController.login);
router.get("/auth/me", projectController.authenticateToken, userController.getMe);

module.exports = router;