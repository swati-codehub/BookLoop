const express = require("express");
const Book = require("../models/Book");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            title,
            author,
            isbn,
            subject,
            category,
            edition,
            condition,
            description,
            price,
            images,
            listingType,
            location
        } = req.body;

        if (!title || !listingType) {
            return res.status(400).json({
                success: false,
                message: "Title and listing type are required"
            });
        }

        const book = await Book.create({
            owner: req.user.id,
            title,
            author,
            isbn,
            subject,
            category,
            edition,
            condition,
            description,
            price,
            images,
            listingType,
            location
        });

        res.status(201).json({
            success: true,
            message: "Book listed successfully",
            book
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to list book",
            error: error.message
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const { search, subject, category, minPrice, maxPrice, listingType, city, area} = req.query;

        let filter = {
            status: "AVAILABLE"
        };

        if (subject){
            filter.subject=subject;
        }

         if (category){
            filter.category=category;
        }

        if (minPrice || maxPrice) {
    filter.price = {};

    if (minPrice) {
        filter.price.$gte = Number(minPrice);
    }

    if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
    }
}

if(listingType){
    filter.listingType = listingType;
}

if (city) {
    filter["location.city"] = city;
}

if (area) {
    filter["location.area"] = area;
}
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { author: { $regex: search, $options: "i" } },
                { isbn: { $regex: search, $options: "i" } }
            ];
        }

        const books = await Book.find(filter)
            .populate("owner", "name email college city");

        res.json({
            success: true,
            count: books.length,
            books
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch books",
            error: error.message
        });
    }
});

router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // Only the owner can update the book
        if (book.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to update this book"
            });
        }

        const {
            title,
            author,
            isbn,
            subject,
            category,
            edition,
            condition,
            description,
            price,
            images,
            listingType,
            location,
            status
        } = req.body;

        book.title = title ?? book.title;
        book.author = author ?? book.author;
        book.isbn = isbn ?? book.isbn;
        book.subject = subject ?? book.subject;
        book.category = category ?? book.category;
        book.edition = edition ?? book.edition;
        book.condition = condition ?? book.condition;
        book.description = description ?? book.description;
        book.price = price ?? book.price;
        book.images = images ?? book.images;
        book.listingType = listingType ?? book.listingType;
        book.location = location ?? book.location;
        book.status = status ?? book.status;

        await book.save();

        res.json({
            success: true,
            message: "Book updated successfully",
            book
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update book",
            error: error.message
        });
    }
});
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // Only the owner can delete the book
        if (book.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to delete this book"
            });
        }

        await Book.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Book deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete book",
            error: error.message
        });
    }
});

router.patch("/:id/unavailable", authMiddleware, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // Only the owner can mark the book unavailable
        if (book.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to update this book"
            });
        }

        book.status = "UNAVAILABLE";

        await book.save();

        res.json({
            success: true,
            message: "Book marked as unavailable",
            book
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update book status",
            error: error.message
        });
    }
});
module.exports = router;