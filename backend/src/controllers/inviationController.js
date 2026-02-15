const mongoose = require("mongoose");
const Project = require("../models/Project");
const Invitation = require("../models/Inviation"); // Note: file name typo
const User = require("../models/User");

// Invite a user to a project
const inviteUser = async (req, res) => {
    try {
        console.log("here");
        
        const { user, projectId, email } = req.body;
        
        // Find project
        const project = await Project.findOne({ id: Number(projectId) });
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Check if user is owner
        if (project.ownerId !== user.id) {
            return res.status(403).json({ message: "You cant invite yourself" });
        }

        // Find invited user
        const invitedUser = await User.findOne({ email });
        if (!invitedUser) return res.status(404).json({ message: "User not found" });

        // Generate invitation ID
        const lastInvitation = await Invitation.findOne().sort({ id: -1 });
        const newId = lastInvitation ? lastInvitation.id + 1 : 1;

        // Create invitation
        const invitation = new Invitation({
            id: newId,
            projectId: Number(projectId),
            email,
            status: "pending"
        });

        await invitation.save();
        res.status(201).json({ message: "Invitation sent" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};




// Get invitations for logged-in user
const getUserInvitations = async (req, res) => {
    try {
        const user = await User.findOne({ id: req.user.id });
        if (!user) return res.status(404).json({ message: "User not found" });

        const userInvitations = await Invitation.find({ 
            email: user.email, 
            status: "pending" 
        });
        
        const invitationsWithProjectNames = await Promise.all(
            userInvitations.map(async (inv) => {
                try {
                    const project = await Project.findOne({ id: inv.projectId });
                    
                    // Get owner name if project exists
                    let ownerName = "Unknown";
                    if (project && project.ownerId) {
                        const owner = await User.findOne({ id: project.ownerId });
                        ownerName = owner?.name || "Unknown";
                    }
                    
                    return {
                        id: inv.id,              // Include invitation ID
                        projectId: inv.projectId,
                        projectName: project?.name || "Unknown Project",
                        projectOwner: ownerName,
                        email: inv.email,
                        status: inv.status,      // Include status
                        createdAt: inv.createdAt
                    };
                } catch (error) {
                    console.error(`Error fetching project ${inv.projectId}:`, error);
                    return {
                        id: inv.id,
                        projectId: inv.projectId,
                        projectName: "Error Loading Project",
                        projectOwner: "Unknown",
                        email: inv.email,
                        status: inv.status,
                        createdAt: inv.createdAt
                    };
                }
            })            
        );
        
        res.json(invitationsWithProjectNames);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Accept invitation
const acceptInvitation = async (req, res) => {
    try {
        const invitationId = Number(req.params.id);
        
        // Find invitation
        const invitation = await Invitation.findOne({ id: invitationId });
        if (!invitation) return res.status(404).json({ message: "Invitation not found" });

        // Get user
        const user = await User.findOne({ id: req.user.id });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check if invitation is for this user
        if (invitation.email !== user.email)
            return res.status(403).json({ message: "Not authorized to accept this invitation" });

        // Find project
        const project = await Project.findOne({ id: invitation.projectId });
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Update project members (note: field name has typo "memebers")
        project.membersListId.push(user.id)
        await project.save();

        // Update invitation status
        invitation.status = "accepted";
        await invitation.save();

        res.json({ message: "Invitation accepted", project });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Decline invitation
const declineInvitation = async (req, res) => {
    try {
        const invitationId = Number(req.params.id);
        
        // Find invitation
        const invitation = await Invitation.findOne({ id: invitationId });
        if (!invitation) return res.status(404).json({ message: "Invitation not found" });

        // Get user
        const user = await User.findOne({ id: req.user.id });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check authorization
        if (invitation.email !== user.email)
            return res.status(403).json({ message: "Not authorized" });

        // Update invitation status
        invitation.status = "declined";
        await invitation.save();

        res.json({ message: "Invitation declined" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    inviteUser,
    getUserInvitations,
    acceptInvitation,
    declineInvitation
};