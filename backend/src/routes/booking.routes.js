const router = require("express").Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  checkAvailability,
  getCarBookings,
} = require("../controllers/booking.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// All booking routes require authentication
router.post("/", authenticateToken, createBooking);
router.get("/", authenticateToken, getBookings);
router.get("/:id", authenticateToken, getBookingById);
router.put("/:id", authenticateToken, updateBooking);
router.delete("/:id", authenticateToken, cancelBooking);
router.get("/check-availability/:carId", checkAvailability); // Public endpoint for checking availability
router.get("/car/:carId", getCarBookings); // Public endpoint for car booking calendar

module.exports = router;


