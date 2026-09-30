const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const Book = require("../models/Book");
const BookRequest = require("../models/BookRequest");
const Transaction = require("../models/Transaction");
const Exchange = require("../models/Exchange");
const Review = require("../models/Review");
const Notification = require("../models/Notification");

router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const [
            books,
            requests,
            transactions,
            exchanges,
            reviews,
            unreadNotifications
        ] = await Promise.all([
            Book.countDocuments({ owner: userId }),

            BookRequest.countDocuments({ user: userId }),

            Transaction.countDocuments({
                $or: [
                    { buyer: userId },
                    { seller: userId }
                ]
            }),

            Exchange.countDocuments({
                $or: [
                    { requester: userId },
                    { owner: userId }
                ]
            }),

            Review.countDocuments({
                reviewer: userId
            }),

            Notification.countDocuments({
                user: userId,
                isRead: false
            })
        ]);

        res.json({
            success: true,
            dashboard: {
                books,
                requests,
                transactions,
                exchanges,
                reviews,
                unreadNotifications
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load dashboard",
            error: error.message
        });
    }
});

module.exports = router;