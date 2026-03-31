const router = require("express").Router();
const carController = require("../controllers/car.controller"); // Changed to import the whole object
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get("/search", carController.searchCars); // Kept original handler, added comment
router.get("/", carController.getCars);
router.get("/nearby", carController.getNearbyCars); // Must be before /:id
router.get("/:id", carController.getCarById);
router.post("/", authenticateToken, carController.createCar); // Changed to use carController
router.put("/:id", authenticateToken, carController.updateCar); // Changed to use carController
router.delete("/:id", authenticateToken, carController.deleteCar); // Changed to use carController

module.exports = router;
