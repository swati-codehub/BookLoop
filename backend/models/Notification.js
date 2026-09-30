const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: [
                "BOOK_REQUEST",
                "REQUEST_ACCEPTED",
                "REQUEST_REJECTED",
                "SALE_REQUEST",
                "SALE_ACCEPTED",
                "SALE_COMPLETED",
                "DONATION_REQUEST",
                "DONATION_ACCEPTED",
                "EXCHANGE_REQUEST",
                "EXCHANGE_ACCEPTED",
                "EXCHANGE_REJECTED",
                "EXCHANGE_COMPLETED",
                "MATCH_FOUND"
            ],
            required: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        relatedId: {
            type: mongoose.Schema.Types.ObjectId
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Notification", notificationSchema);