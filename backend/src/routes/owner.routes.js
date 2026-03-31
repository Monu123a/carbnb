const router = require("express").Router();
const {
  addCar,
  getOwnerCars,
  updateCar,
  deleteCar,
  getOwnerBookings,
  updateOwnerBookingStatus,
} = require("../controllers/owner.controller");
const { upload, uploadToSupabase } = require("../middlewares/upload.middleware");
const { authenticateToken } = require("../middlewares/auth.middleware");

// All owner routes require authentication
router.post("/cars", authenticateToken, upload.single('image'), uploadToSupabase, addCar);
router.get("/cars", authenticateToken, getOwnerCars);
router.put("/cars/:id", authenticateToken, upload.single('image'), uploadToSupabase, updateCar);
router.delete("/cars/:id", authenticateToken, deleteCar);

// Bookings for cars owned by the authenticated user
router.get("/bookings", authenticateToken, getOwnerBookings);
router.put("/bookings/:id/status", authenticateToken, updateOwnerBookingStatus);

module.exports = router;
