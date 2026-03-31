const reviewService = require("../services/review.service");

exports.addReview = async (req, res) => {
  try {
    const { carId, bookingId, rating, comment } = req.body;

    if (!carId || !bookingId || !rating) {
      return res.status(400).json({ error: "Missing required fields: carId, bookingId, rating" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const userId = req.user.id;
    const review = await reviewService.addReview(userId, req.body);
    res.status(201).json(review);
  } catch (error) {
    console.error("Error adding review:", error);
    
    // Handle specific errors
    if (error.message.includes("not found") || 
        error.message.includes("not completed") ||
        error.message.includes("already been reviewed")) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: "Failed to add review", message: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getReviews(req.params.carId);
    res.json(reviews);
  } catch (error) {
    console.error("Error getting reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews", message: error.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json(review);
  } catch (error) {
    console.error("Error getting review:", error);
    res.status(500).json({ error: "Failed to fetch review", message: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rating, comment } = req.body;

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const review = await reviewService.updateReview(req.params.id, userId, req.body);

    if (!review) {
      return res.status(404).json({ error: "Review not found or you don't have permission to update it" });
    }

    res.json(review);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Failed to update review", message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const review = await reviewService.deleteReview(req.params.id, userId);

    if (!review) {
      return res.status(404).json({ error: "Review not found or you don't have permission to delete it" });
    }

    res.json({ message: "Review deleted successfully", review });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review", message: error.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviews = await reviewService.getUserReviews(userId);
    res.json(reviews);
  } catch (error) {
    console.error("Error getting user reviews:", error);
    res.status(500).json({ error: "Failed to fetch user reviews", message: error.message });
  }
};

exports.checkEligibility = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    // Check if user has a completed booking for this car that hasn't been reviewed yet
    // The simplified logic here just checks if the booking exists, is completed, belongs to user, and has no review
    const isEligible = await reviewService.checkReviewEligibility(userId, bookingId);

    res.json({ eligible: isEligible });
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    res.status(500).json({ error: "Failed to check eligibility", message: error.message });
  }
};
