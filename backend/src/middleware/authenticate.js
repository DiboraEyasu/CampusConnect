
const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  // Require a Bearer token
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required."
    });
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Authentication token is missing."
    });
  }

  try {
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
      throw new Error("JWT_SECRET is missing or too short.");
    }

    const payload = jwt.verify(token, secret);

    if (
      typeof payload !== "object" ||
      typeof payload.sub !== "string"
    ) {
      return res.status(401).json({
        status: "error",
        message: "Invalid authentication token."
      });
    }

    // Store the verified identity for the next handler
    req.userId = payload.sub;

    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        status: "error",
        message: "Invalid or expired authentication token."
      });
    }

    console.error("Authentication error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Authentication service unavailable."
    });
  }
}

module.exports = authenticate;