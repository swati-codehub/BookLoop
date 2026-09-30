const express = require("express");
const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const authMiddleware = require("../middleware/authMiddleware");
const createNotification = require("../Utils/createNotification");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { bookId } = req.body;

        if (!bookId) {
            return res.status(400).json({
                success: false,
                message: "Book ID is required"
            });
        }

        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        if (book.status !== "AVAILABLE") {
            return res.status(400).json({
                success: false,
                message: "Book is not available"
            });
        }

        if (book.owner.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot buy your own book"
            });
        }

        const transaction = await Transaction.create({
            buyer: req.user.id,
            seller: book.owner,
            book: book._id,
            type: "SALE",
            amount: book.price,
            status: "PENDING"
        });

        await createNotification({
    user: book.owner,
    type: "SALE_REQUEST",
    message: "You received a new sale request.",
    relatedId: transaction._id
});
        res.status(201).json({
            success: true,
            message: "Purchase request sent successfully",
            transaction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create purchase request",
            error: error.message
        });
    }
});

router.patch("/:id/accept", authMiddleware, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate("book");

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        if (transaction.seller.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Only the seller can accept this request"
            });
        }

        if (transaction.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Only pending transactions can be accepted"
            });
        }

        transaction.status = "ACCEPTED";

        await transaction.save();
if (transaction.type === "SALE") {
    await createNotification({
        user: transaction.buyer,
        type: "SALE_ACCEPTED",
        message: "Your sale request was accepted.",
        relatedId: transaction._id
    });
}

if (transaction.type === "DONATION") {
    await createNotification({
        user: transaction.buyer,
        type: "DONATION_ACCEPTED",
        message: "Your donation request was accepted.",
        relatedId: transaction._id
    });
}


        res.json({
            success: true,
            message: "Purchase request accepted",
            transaction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to accept transaction",
            error: error.message
        });
    }
});

router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate("buyer", "name email")
            .populate("seller", "name email")
            .populate("book", "title price listingType status");

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        const userId = req.user.id;

        if (
            transaction.buyer._id.toString() !== userId &&
            transaction.seller._id.toString() !== userId
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to view this transaction"
            });
        }

        res.json({
            success: true,
            transaction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch transaction",
            error: error.message
        });
    }
});

router.patch("/:id/complete", authMiddleware, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        if (transaction.buyer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Only the buyer can complete this transaction"
            });
        }

        if (transaction.status !== "ACCEPTED") {
            return res.status(400).json({
                success: false,
                message: "Only accepted transactions can be completed"
            });
        }

        const book = await Book.findById(transaction.book);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        transaction.status = "COMPLETED";
        transaction.completedAt = new Date();

        book.status = "SOLD";

        await transaction.save();
        await book.save();

        await createNotification({
    user: transaction.seller,
    type: "SALE_COMPLETED",
    message: "Your sale transaction was completed.",
    relatedId: transaction._id
});
        res.json({
            success: true,
            message: "Transaction completed successfully",
            transaction,
            book: {
                id: book._id,
                status: book.status
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to complete transaction",
            error: error.message
        });
    }
});

router.post("/donate", authMiddleware, async (req, res) => {
    try {
        const { bookId } = req.body;

        if (!bookId) {
            return res.status(400).json({
                success: false,
                message: "Book ID is required"
            });
        }

        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        if (book.status !== "AVAILABLE") {
            return res.status(400).json({
                success: false,
                message: "Book is not available"
            });
        }

        if (book.listingType !== "DONATE") {
            return res.status(400).json({
                success: false,
                message: "This book is not listed for donation"
            });
        }

        if (book.owner.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot request your own book"
            });
        }

        const transaction = await Transaction.create({
            buyer: req.user.id,
            seller: book.owner,
            book: book._id,
            type: "DONATION",
            amount: 0,
            status: "PENDING"
        });
await createNotification({
    user: book.owner,
    type: "DONATION_REQUEST",
    message: "You received a new donation request.",
    relatedId: transaction._id
});
        res.status(201).json({
            success: true,
            message: "Donation request sent successfully",
            transaction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create donation request",
            error: error.message
        });
    }
});

router.patch("/:id/complete-donation", authMiddleware, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        if (transaction.type !== "DONATION") {
            return res.status(400).json({
                success: false,
                message: "This is not a donation transaction"
            });
        }

        if (transaction.buyer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Only the receiver can complete this donation"
            });
        }

        if (transaction.status !== "ACCEPTED") {
            return res.status(400).json({
                success: false,
                message: "Only accepted donations can be completed"
            });
        }

        const book = await Book.findById(transaction.book);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        transaction.status = "COMPLETED";
        transaction.completedAt = new Date();

        book.status = "DONATED";

        await transaction.save();
        await book.save();

        res.json({
            success: true,
            message: "Donation completed successfully",
            transaction,
            book: {
                id: book._id,
                status: book.status
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to complete donation",
            error: error.message
        });
    }
});
module.exports = router;