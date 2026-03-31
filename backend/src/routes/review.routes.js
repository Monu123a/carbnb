const router = require("express").Router();
const {
  addReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getUserReviews,
  checkEligibility,
} = require("../controllers/review.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// POST, PUT, DELETE require authentication; GET routes are public
// POST, PUT, DELETE require authentication; GET routes are public
router.post("/", authenticateToken, addReview);
router.get("/user", authenticateToken, getUserReviews); // Specific path before generic :id
router.get("/car/:carId", getReviews);
router.get("/eligibility/:bookingId", authenticateToken, checkEligibility);
router.get("/:id", getReviewById);
router.put("/:id", authenticateToken, updateReview);
router.delete("/:id", authenticateToken, deleteReview);

module.exports = router;
