const express = require("express");
const router = express.Router();
const invitationController = require("../controllers/inviationController");
const projectController = require("../controllers/projectController");

router.post("/api", projectController.authenticateToken, invitationController.inviteUser);
router.get("/api", projectController.authenticateToken, invitationController.getUserInvitations);
router.post("/api/:id/accept", projectController.authenticateToken, invitationController.acceptInvitation);
router.post("/api/:id/decline", projectController.authenticateToken, invitationController.declineInvitation);

module.exports = router;