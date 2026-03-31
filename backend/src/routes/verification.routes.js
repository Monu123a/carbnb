const express = require("express");
const router = express.Router();
const verificationController = require("../controllers/verification.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.post("/upload", authenticateToken, verificationController.uploadDocs);
router.get("/status", authenticateToken, verificationController.getStatus);
router.post("/verify", authenticateToken, verificationController.verifyUser); // Admin simulation

module.exports = router;
