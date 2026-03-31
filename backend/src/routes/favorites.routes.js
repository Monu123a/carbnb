const router = require("express").Router();
const { toggleFavorite, getFavorites, checkFavorite } = require("../controllers/favorites.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Apply authentication middleware to all favorite routes
router.use(authenticateToken);

router.post("/", toggleFavorite);
router.get("/", getFavorites);
router.get("/check/:carId", checkFavorite);

module.exports = router;
