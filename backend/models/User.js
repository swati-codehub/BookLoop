const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        college: {
            type: String,
            trim: true
        },

        city: {
            type: String,
            trim: true
        },

        area: {
            type: String,
            trim: true
        },
        role: {
    type: String,
    enum: ["USER", "ADMIN"],
    default: "USER"
}
        
    },
    
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);