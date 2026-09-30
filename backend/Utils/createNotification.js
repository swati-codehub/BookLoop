const Notification = require("../models/Notification");

const createNotification = async ({
    user,
    type,
    message,
    relatedId = null
}) => {
    try {
        const notification = await Notification.create({
            user,
            type,
            message,
            relatedId
        });

        return notification;

    } catch (error) {
        console.error(
            "Notification creation failed:",
            error.message
        );

        throw error;
    }
};

module.exports = createNotification;