const express = require("express");
const BookRequest = require("../models/BookRequest");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const Book = require("../models/Book");
const calculateMatchScore = require("../utils/matchScore");
const createNotification = require("../Utils/createNotification");
const Notification = require("../models/Notification");

router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            title,
            author,
            subject,
            preferredEdition,
            preferredCondition,
            maxBudget,
            preference,
            location
        } = req.body;

        if (!title || !preference) {
            return res.status(400).json({
                success: false,
                message: "Title and preference are required"
            });
        }

        const request = await BookRequest.create({
            user: req.user.id,
            title,
            author,
            subject,
            preferredEdition,
            preferredCondition,
            maxBudget,
            preference,
            location
        });

        await createNotification({
    user: req.user.id,
    type: "BOOK_REQUEST",
    message: "Your book request was created successfully.",
    relatedId: request._id
});

        res.status(201).json({
            success: true,
            message: "Book request created successfully",
            request
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create book request",
            error: error.message
        });
    }
});

router.get("/my", authMiddleware, async (req, res) => {
    try {
        const requests = await BookRequest.find({
            user: req.user.id
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch your book requests",
            error: error.message
        });
    }
});

router.get("/active", authMiddleware, async (req, res) => {
    try {
        const requests = await BookRequest.find({
            user: req.user.id,
            status: "ACTIVE"
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch active requests",
            error: error.message
        });
    }
});

router.patch("/:id/cancel", authMiddleware, async (req, res) => {
    try {
        const request = await BookRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Book request not found"
            });
        }

        if (request.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to cancel this request"
            });
        }

        if (request.status !== "ACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Only active requests can be cancelled"
            });
        }

        request.status = "CANCELLED";

        await request.save();

        res.json({
            success: true,
            message: "Book request cancelled successfully",
            request
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to cancel book request",
            error: error.message
        });
    }
});

router.get("/:id/matches", authMiddleware, async (req, res) => {
    try {
        const request = await BookRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Book request not found"
            });
        }

        if (request.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to view these matches"
            });
        }

        const books = await Book.find({
            status: "AVAILABLE"
        }).populate("owner", "name email college city");

        const matches = books
            .map(book => ({
                book,
                matchScore: calculateMatchScore(request, book)
            }))
            .sort((a, b) => b.matchScore - a.matchScore);
const existingNotification = await Notification.findOne({
    user: request.user,
    type: "MATCH_FOUND",
    relatedId: request._id
});

if (!existingNotification && matches.length > 0) {
    await createNotification({
        user: request.user,
        type: "MATCH_FOUND",
        message: "A matching book was found for your request.",
        relatedId: request._id
    });
}
        res.json({
            success: true,
            requestId: request._id,
            count: matches.length,
            matches
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to find matching books",
            error: error.message
        });
    }
});
module.exports = router;