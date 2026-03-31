const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  updateMe,
  googleAuth,
} = require("../controllers/auth.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getMe);
router.put("/me", authenticateToken, updateMe);
router.post("/logout", authenticateToken, logout);

router.post("/logout", authenticateToken, logout);
router.post("/google", googleAuth);

module.exports = router;
