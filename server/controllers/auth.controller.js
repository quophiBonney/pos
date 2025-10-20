import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";

/**
 * REGISTER - accepts single JSON or array of JSON
 */
export const register = async (req, res) => {
  try {
    let usersData = req.body;

    // Normalize input to an array
    if (!Array.isArray(usersData)) {
      usersData = [usersData];
    }

    const createdUsers = [];

    for (const data of usersData) {
      const { fullName, email, password, role, roleName } = data;

      if (!fullName || !email || !password) {
        return res
          .status(400)
          .json({ message: "fullName, email, and password are required" });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ fullName }, { email }],
      });
      if (existingUser) {
        return res.status(400).json({
          message: `User with name or email already exists: ${email}`,
        });
      }

      // Find role (accepts either role ID or role name)
      let foundRole = null;
      if (role) {
        foundRole = await Role.findById(role);
      } else if (roleName) {
        foundRole = await Role.findOne({ name: roleName });
      } else {
        foundRole = await Role.findOne({ name: "cashier" });
      }

      if (!foundRole) {
        return res.status(400).json({ message: "Invalid role provided" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        fullName,
        email,
        passwordHash,
        role: foundRole._id,
      });

      createdUsers.push({
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: foundRole.name,
      });
    }

    res.status(201).json({
      message: "User(s) registered successfully",
      users: createdUsers,
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  try {
    // ✅ Works whether data comes as JSON or form data
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).populate("role");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role.name },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role.name,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate("role", "name");

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params; // user ID from URL
    const { roleId } = req.body; // new role ID from body

    if (!roleId) {
      return res.status(400).json({ message: "Role ID is required" });
    }

    // Find role
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Update user role
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: roleId },
      { new: true }
    ).populate("role");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Role Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
