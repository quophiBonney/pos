import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Authentication middleware
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1]; // Expect: "Bearer <token>"
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Load full user info with role
    const user = await User.findById(decoded.id).populate("role");
    if (!user) return res.status(401).json({ message: "Invalid token user." });

    req.user = user; // attach user object to request
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Role-based access control middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role.name)) {
      return res.status(403).json({ message: "Forbidden: Insufficient rights" });
    }
    next();
  };
};
