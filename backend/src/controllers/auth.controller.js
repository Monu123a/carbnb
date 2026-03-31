const authService = require("../services/auth.service");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Missing required fields: name, email, password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    const result = await authService.register({ name, email, password, phone });
    res.status(201).json(result);
  } catch (error) {
    console.error("Error registering user:", error);
    if (error.message === "User with this email already exists") {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to register user", message: error.message });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, picture } = ticket.getPayload();

    const result = await authService.googleLogin({ name, email, image: picture });
    res.json(result);
  } catch (error) {
    console.error("Error verifying Google token:", error);
    res.status(401).json({ error: "Invalid Google token", message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Missing required fields: email, password",
      });
    }

    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    console.error("Error logging in:", error);
    if (error.message === "Invalid email or password") {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to login", message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Failed to fetch user", message: error.message });
  }
};

exports.logout = async (req, res) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  // But we can add token blacklisting here if needed in the future
  res.json({ message: "Logged out successfully" });
};

exports.updateMe = async (req, res) => {
  try {
    const { name, phone } = req.body;
    console.log(`📞 UPDATE PROFILE REQUEST - User ID: ${req.user.id}, Name: ${name}, Phone: ${phone}`);
    let image = req.body.image;

    if (req.file) {
      image = req.file.supabaseUrl;
    }

    const user = await authService.updateUserProfile(req.user.id, {
      name,
      phone,
      image,
    });

    console.log(`📞 PROFILE UPDATED - User ${user.id} now has phone: ${user.phone}`);
    res.json(user);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res
      .status(500)
      .json({ error: "Failed to update profile", message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await authService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Don't expose sensitive info like phone unless authorized (handled in service or here)
    // For now, returning the user object as service returns it (usually safe subset)
    res.json(user);
  } catch (error) {
    console.error("Error getting user by ID:", error);
    res.status(500).json({ error: "Failed to fetch user", message: error.message });
  }
};
