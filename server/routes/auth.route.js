import express from "express";
import {
  register,
  login,
  getAllUsers,
  updateUserRole,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", getAllUsers);
router.put("/users/:id", updateUserRole);
export default router;
