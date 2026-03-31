const tripService = require("../services/trip.service");

exports.uploadPhotos = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookingId, type, photos } = req.body;

        if (!bookingId || !type || !photos) {
            return res.status(400).json({ error: "Missing required fields: bookingId, type, photos" });
        }

        const updatedBooking = await tripService.uploadTripPhotos(bookingId, userId, type, photos);
        res.json(updatedBooking);
    } catch (error) {
        console.error("Error uploading trip photos:", error);
        res.status(500).json({ error: "Failed to upload trip photos", message: error.message });
    }
};

exports.getPhotos = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookingId } = req.params;

        const photos = await tripService.getTripPhotos(bookingId, userId);
        res.json(photos);
    } catch (error) {
        console.error("Error getting trip photos:", error);
        res.status(500).json({ error: "Failed to fetch trip photos", message: error.message });
    }
};
