const express = require("express");
const router = express.Router();

const Review = require("../models/Review");
const Transaction = require("../models/Transaction");
const Exchange = require("../models/Exchange");
const authMiddleware = require("../middleware/authMiddleware");

// Create a review
router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            reviewedUser,
            rating,
            comment,
            transaction,
            exchange
        } = req.body;

        if (!reviewedUser || !rating) {
            return res.status(400).json({
                success: false,
                message: "Reviewed user and rating are required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        // Prevent reviewing yourself
        if (reviewedUser === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot review yourself"
            });
        }

        // Transaction review
        if (transaction) {
            const existingTransaction =
                await Transaction.findById(transaction);

            if (!existingTransaction) {
                return res.status(404).json({
                    success: false,
                    message: "Transaction not found"
                });
            }

            if (existingTransaction.status !== "COMPLETED") {
                return res.status(400).json({
                    success: false,
                    message: "You can review only completed transactions"
                });
            }

            if (
                existingTransaction.buyer.toString() !== req.user.id &&
                existingTransaction.seller.toString() !== req.user.id
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You are not part of this transaction"
                });
            }
        }

        // Exchange review
        if (exchange) {
            const existingExchange =
                await Exchange.findById(exchange);

            if (!existingExchange) {
                return res.status(404).json({
                    success: false,
                    message: "Exchange not found"
                });
            }

            if (existingExchange.status !== "COMPLETED") {
                return res.status(400).json({
                    success: false,
                    message: "You can review only completed exchanges"
                });
            }

            if (
                existingExchange.requester.toString() !== req.user.id &&
                existingExchange.owner.toString() !== req.user.id
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You are not part of this exchange"
                });
            }
        }
const existingReview = await Review.findOne({
    reviewer: req.user.id,
    reviewedUser,
    transaction: transaction || null,
    exchange: exchange || null
});

if (existingReview) {
    return res.status(400).json({
        success: false,
        message: "You have already reviewed this transaction or exchange"
    });
}
        const review = await Review.create({
            reviewer: req.user.id,
            reviewedUser,
            rating,
            comment,
            transaction,
            exchange
        });

        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            review
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to submit review",
            error: error.message
        });
    }
});
// Get reviews received by a user
router.get("/user/:userId", authMiddleware, async (req, res) => {
    try {
        const reviews = await Review.find({
            reviewedUser: req.params.userId
        })
            .populate("reviewer", "name email")
            .sort({ createdAt: -1 });

        const count = reviews.length;

        const averageRating = count > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / count
            : 0;

        res.json({
            success: true,
            count,
            averageRating: Number(averageRating.toFixed(1)),
            reviews
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch reviews",
            error: error.message
        });
    }
});

// Get reviews given by logged-in user
router.get("/my", authMiddleware, async (req, res) => {
    try {
        const reviews = await Review.find({
            reviewer: req.user.id
        })
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
            message: "Failed to fetch your reviews",
            error: error.message
        });
    }
});
module.exports = router;