const mongoose = require("mongoose");

const exchangeSchema = new mongoose.Schema(
    {
        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        offeredBook: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: true
        },

        requestedBook: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: true
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "ACCEPTED",
                "REJECTED",
                "CANCELLED",
                "COMPLETED"
            ],
            default: "PENDING"
        },

        message: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Exchange", exchangeSchema);