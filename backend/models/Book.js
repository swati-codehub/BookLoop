const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        author: {
            type: String,
            trim: true
        },

        isbn: {
            type: String,
            trim: true
        },

        subject: {
            type: String,
            trim: true
        },

        category: {
            type: String,
            trim: true
        },

        edition: {
            type: String,
            trim: true
        },

        condition: {
            type: String,
            enum: ["NEW", "LIKE_NEW", "GOOD", "FAIR"],
            default: "GOOD"
        },

        description: {
            type: String,
            trim: true
        },

        price: {
            type: Number,
            default: 0,
            min: 0
        },

        images: [{
            type: String
        }],

        listingType: {
            type: String,
            enum: ["SELL", "EXCHANGE", "DONATE"],
            required: true
        },

        location: {
            city: String,
            area: String
        },

        status: {
            type: String,
            enum: [
                "AVAILABLE",
                "RESERVED",
                "SOLD",
                "EXCHANGED",
                "DONATED",
                "UNAVAILABLE"
            ],
            default: "AVAILABLE"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Book", bookSchema);