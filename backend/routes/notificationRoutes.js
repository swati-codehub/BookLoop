const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

// Get user's notifications
router.get("/", authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({
            user: req.user.id
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: notifications.length,
            notifications
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
            error: error.message
        });
    }
});

// Get unread notification count
router.get("/unread-count", authMiddleware, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            user: req.user.id,
            isRead: false
        });

        res.json({
            success: true,
            unreadCount: count
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get unread count",
            error: error.message
        });
    }
});

// Mark notification as read
router.patch("/:id/read", authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        notification.isRead = true;
        await notification.save();

        res.json({
            success: true,
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to mark notification as read",
            error: error.message
        });
    }
});

module.exports = router;