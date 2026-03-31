const express = require("express");
const router = express.Router();
const tripController = require("../controllers/trip.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.post("/photos", authenticateToken, tripController.uploadPhotos);
router.get("/photos/:bookingId", authenticateToken, tripController.getPhotos);

module.exports = router;
