const verificationService = require("../services/verification.service");

exports.uploadDocs = async (req, res) => {
    try {
        const userId = req.user.id;
        const { aadhaarNumber, drivingLicenseNumber } = req.body;

        if (!aadhaarNumber && !drivingLicenseNumber) {
            return res.status(400).json({ error: "No documents provided" });
        }

        const user = await verificationService.uploadVerificationDocs(userId, { aadhaarNumber, drivingLicenseNumber });
        res.json(user);
    } catch (error) {
        console.error("Error uploading verification docs:", error);
        res.status(500).json({ error: "Failed to upload verification documents", message: error.message });
    }
};

exports.verifyUser = async (req, res) => {
    try {
        const { userId, isVerified } = req.body;

        // In a real app, this would be admin-only
        const user = await verificationService.verifyUser(userId, isVerified);
        res.json(user);
    } catch (error) {
        console.error("Error verifying user:", error);
        res.status(500).json({ error: "Failed to verify user", message: error.message });
    }
};

exports.getStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const status = await verificationService.getVerificationStatus(userId);
        res.json(status);
    } catch (error) {
        console.error("Error getting verification status:", error);
        res.status(500).json({ error: "Failed to fetch verification status", message: error.message });
    }
};
