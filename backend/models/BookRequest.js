const mongoose = require("mongoose");

const bookRequestSchema = new mongoose.Schema(
    {
        user: {
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

        subject: {
            type: String,
            trim: true
        },

        preferredEdition: {
            type: String,
            trim: true
        },

        preferredCondition: {
            type: String,
            enum: ["NEW", "LIKE_NEW", "GOOD", "FAIR"]
        },

        maxBudget: {
            type: Number,
            min: 0,
            default: 0
        },

        preference: {
            type: String,
            enum: ["BUY", "EXCHANGE", "FREE"],
            required: true
        },

        location: {
            city: {
                type: String,
                trim: true
            },
            area: {
                type: String,
                trim: true
            }
        },

        status: {
            type: String,
            enum: ["ACTIVE", "MATCHED", "FULFILLED", "CANCELLED"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("BookRequest", bookRequestSchema);