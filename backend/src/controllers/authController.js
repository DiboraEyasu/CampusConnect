
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Validate registration data
function validateRegistration(name, email, password) {
  if (typeof name !== "string" || name.trim().length < 2) {
    return "Name must contain at least 2 characters.";
  }

  if (typeof email !== "string" || email.trim() === "") {
    return "A valid email is required.";
  }

  const normalizedEmail = email.trim().toLowerCase();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    return "Please provide a valid email address.";
  }

  if (typeof password !== "string") {
    return "Password is required.";
  }

  if (password.length < 8) {
    return "Password must contain at least 8 characters.";
  }

  // bcrypt only uses up to 72 bytes of password input
  if (Buffer.byteLength(password, "utf8") > 72) {
    return "Password is too long.";
  }

  return null;
}

// Create a safe response object
function createUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt
  };
}

// Create an authentication token
function createToken(user) {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET is missing or too short.");
  }

  return jwt.sign(
    {
      sub: user._id.toString()
    },
    secret,
    {
      expiresIn: "1h"
    }
  );
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};

    const validationError = validateRegistration(
      name,
      email,
      password
    );

    if (validationError) {
      return res.status(400).json({
        status: "error",
        message: validationError
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether the account already exists
    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "An account with this email already exists."
      });
    }

    // Hash the password before saving it
    const passwordHash = await bcrypt.hash(password, 12);

    // Never accept the role from public registration input
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "student"
    });

    const token = createToken(user);

    return res.status(201).json({
      status: "success",
      message: "Account created successfully.",
      token,
      user: createUserResponse(user)
    });
  } catch (error) {
    // A unique email index may reject simultaneous registrations
    if (error.code === 11000) {
      return res.status(409).json({
        status: "error",
        message: "An account with this email already exists."
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: "error",
        message: "The submitted user data is invalid."
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Unable to create the account."
    });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required."
      });
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        status: "error",
        message: "Invalid email or password."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // passwordHash is excluded by default, so request it explicitly
    const user = await User.findOne({
      email: normalizedEmail
    }).select("+passwordHash");

    // Use a generic message to avoid revealing whether an email exists
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password."
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      status: "success",
      message: "Login successful.",
      token,
      user: createUserResponse(user)
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Unable to log in."
    });
  }
}

module.exports = {
  register,
  login
};
