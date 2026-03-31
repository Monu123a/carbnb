const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* -------- MIDDLEWARE -------- */
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* -------- ROUTES -------- */

// Health check / root route
app.get("/", (req, res) => {
  res.json({ message: "CarBnB backend running 🚗" });
});

// Feature routes
app.use("/auth", require("./src/routes/auth.routes"));
app.use("/cars", require("./src/routes/car.routes"));
app.use("/owner", require("./src/routes/owner.routes"));
app.use("/bookings", require("./src/routes/booking.routes"));
app.use("/reviews", require("./src/routes/review.routes"));
app.use("/users", require("./src/routes/user.routes"));
app.use("/favorites", require("./src/routes/favorites.routes"));
app.use("/verification", require("./src/routes/verification.routes"));
app.use("/trips", require("./src/routes/trip.routes"));

/* -------- ERROR HANDLER -------- */
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

/* -------- SERVER -------- */
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
