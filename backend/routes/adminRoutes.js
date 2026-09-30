const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const User = require("../models/User");
const Book = require("../models/Book");
const BookRequest = require("../models/BookRequest");
const Transaction = require("../models/Transaction");
const Exchange = require("../models/Exchange");
const Notification = require("../models/Notification");
const Review = require("../models/Review");

router.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [
            users,
            books,
            requests,
            transactions,
            exchanges
        ] = await Promise.all([
            User.countDocuments(),
            Book.countDocuments(),
            BookRequest.countDocuments(),
            Transaction.countDocuments(),
            Exchange.countDocuments()
        ]);

        res.json({
            success: true,
            stats: {
                users,
                books,
                requests,
                transactions,
                exchanges
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load admin statistics",
            error: error.message
        });
    }
});

router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load users",
            error: error.message
        });
    }
});

router.get("/books", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const books = await Book.find()
            .populate("owner", "name email college city area")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: books.length,
            books
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load books",
            error: error.message
        });
    }
});

router.get("/transactions", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate("buyer", "name email")
            .populate("seller", "name email")
            .populate("book", "title author price")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: transactions.length,
            transactions
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load transactions",
            error: error.message
        });
    }
});

router.get("/exchanges", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const exchanges = await Exchange.find()
            .populate("requester", "name email")
            .populate("owner", "name email")
            .populate("offeredBook", "title author")
            .populate("requestedBook", "title author")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: exchanges.length,
            exchanges
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load exchanges",
            error: error.message
        });
    }
});
router.get("/requests", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const requests = await BookRequest.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load book requests",
            error: error.message
        });
    }
});

router.get("/notifications", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: notifications.length,
            notifications
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load notifications",
            error: error.message
        });
    }
});
router.get("/reviews", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("reviewer", "name email")
            .populate("reviewedUser", "name email")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reviews.length,
            reviews
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load reviews",
            error: error.message
        });
    }
});
module.exports = router;