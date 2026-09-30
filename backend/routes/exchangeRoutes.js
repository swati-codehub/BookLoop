const express = require("express");
const Exchange = require("../models/Exchange");
const Book = require("../models/Book");
const authMiddleware = require("../middleware/authMiddleware");
const createNotification = require("../Utils/createNotification");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            offeredBookId,
            requestedBookId,
            message
        } = req.body;

        if (!offeredBookId || !requestedBookId) {
            return res.status(400).json({
                success: false,
                message: "Offered book and requested book are required"
            });
        }

        if (offeredBookId === requestedBookId) {
            return res.status(400).json({
                success: false,
                message: "You cannot exchange a book with itself"
            });
        }

        const offeredBook = await Book.findById(offeredBookId);
        const requestedBook = await Book.findById(requestedBookId);

        if (!offeredBook || !requestedBook) {
            return res.status(404).json({
                success: false,
                message: "One or both books not found"
            });
        }

        if (offeredBook.status !== "AVAILABLE" ||
            requestedBook.status !== "AVAILABLE") {
            return res.status(400).json({
                success: false,
                message: "Both books must be available"
            });
        }

        if (offeredBook.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only offer your own book"
            });
        }

        if (requestedBook.owner.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot request your own book"
            });
        }

        if (offeredBook.listingType !== "EXCHANGE" ||
            requestedBook.listingType !== "EXCHANGE") {
            return res.status(400).json({
                success: false,
                message: "Both books must be listed for exchange"
            });
        }

        const exchange = await Exchange.create({
            requester: req.user.id,
            owner: requestedBook.owner,
            offeredBook: offeredBook._id,
            requestedBook: requestedBook._id,
            message,
            status: "PENDING"
        });

        await createNotification({
    user: requestedBook.owner,
    type: "EXCHANGE_REQUEST",
    message: "You received a new exchange request.",
    relatedId: exchange._id
});
        res.status(201).json({
            success: true,
            message: "Exchange request sent successfully",
            exchange
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create exchange request",
            error: error.message
        });
    }
});

// Owner accepts exchange request
router.patch("/:id/accept", authMiddleware, async (req, res) => {
    try {
        const exchange = await Exchange.findById(req.params.id);

        if (!exchange) {
            return res.status(404).json({
                success: false,
                message: "Exchange request not found"
            });
        }

        if (exchange.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Only the book owner can accept this request"
            });
        }

        if (exchange.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Only pending requests can be accepted"
            });
        }

        exchange.status = "ACCEPTED";

        await exchange.save();
await createNotification({
    user: exchange.requester,
    type: "EXCHANGE_ACCEPTED",
    message: "Your exchange request was accepted.",
    relatedId: exchange._id
});
        res.json({
            success: true,
            message: "Exchange request accepted",
            exchange
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to accept exchange request",
            error: error.message
        });
    }
});


// Owner rejects exchange request
router.patch("/:id/reject", authMiddleware, async (req, res) => {
    try {
        const exchange = await Exchange.findById(req.params.id);

        if (!exchange) {
            return res.status(404).json({
                success: false,
                message: "Exchange request not found"
            });
        }

        if (exchange.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Only the book owner can reject this request"
            });
        }

        if (exchange.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Only pending requests can be rejected"
            });
        }

        exchange.status = "REJECTED";

        await exchange.save();
await createNotification({
    user: exchange.requester,
    type: "EXCHANGE_REJECTED",
    message: "Your exchange request was rejected.",
    relatedId: exchange._id
});
        res.json({
            success: true,
            message: "Exchange request rejected",
            exchange
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to reject exchange request",
            error: error.message
        });
    }
});
router.patch("/:id/complete", authMiddleware, async (req, res) => {
    try {
        const exchange = await Exchange.findById(req.params.id);

        if (!exchange) {
            return res.status(404).json({
                success: false,
                message: "Exchange request not found"
            });
        }

        if (exchange.requester.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Only the requester can complete this exchange"
            });
        }

        if (exchange.status !== "ACCEPTED") {
            return res.status(400).json({
                success: false,
                message: "Only accepted exchanges can be completed"
            });
        }

        const offeredBook = await Book.findById(exchange.offeredBook);
        const requestedBook = await Book.findById(exchange.requestedBook);

        if (!offeredBook || !requestedBook) {
            return res.status(404).json({
                success: false,
                message: "One or both books not found"
            });
        }

        if (
            offeredBook.status !== "AVAILABLE" ||
            requestedBook.status !== "AVAILABLE"
        ) {
            return res.status(400).json({
                success: false,
                message: "Both books must still be available"
            });
        }

        exchange.status = "COMPLETED";

        offeredBook.status = "EXCHANGED";
        requestedBook.status = "EXCHANGED";

        await exchange.save();
        await offeredBook.save();
        await requestedBook.save();
await createNotification({
    user: exchange.requester,
    type: "EXCHANGE_COMPLETED",
    message: "Your exchange was completed successfully.",
    relatedId: exchange._id
});
        res.json({
            success: true,
            message: "Exchange completed successfully",
            exchange,
            books: {
                offeredBook: {
                    id: offeredBook._id,
                    status: offeredBook.status
                },
                requestedBook: {
                    id: requestedBook._id,
                    status: requestedBook.status
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to complete exchange",
            error: error.message
        });
    }
});
// Get current user's exchanges
router.get("/my", authMiddleware, async (req, res) => {
    try {
        const exchanges = await Exchange.find({
            $or: [
                { requester: req.user.id },
                { owner: req.user.id }
            ]
        })
        .populate("offeredBook", "title author")
        .populate("requestedBook", "title author")
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            exchanges
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch exchanges",
            error: error.message
        });
    }
});
// Find multi-way exchange cycles
router.get("/cycles", authMiddleware, async (req, res) => {
    try {
        const exchanges = await Exchange.find({
            status: "ACCEPTED"
        });

        const { buildExchangeGraph, findExchangeCycles } =
            require("../Utils/exchangeGraph");

        const graph = buildExchangeGraph(exchanges);
        const cycles = findExchangeCycles(graph);

        res.json({
            success: true,
            count: cycles.length,
            cycles
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to detect exchange cycles",
            error: error.message
        });
    }
});
module.exports = router;