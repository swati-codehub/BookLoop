const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        reviewedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        comment: {
            type: String,
            trim: true,
            maxlength: 500
        },

        transaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction"
        },

        exchange: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exchange"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Review", reviewSchema);