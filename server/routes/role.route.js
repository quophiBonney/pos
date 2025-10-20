import express from "express";
import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "../controllers/role.controller.js";

import {
  authMiddleware,
  authorizeRoles,
} from "../middleware/auth.mddleware.js";

const router = express.Router();

// Only admins should manage roles
router.post("/role", authMiddleware, authorizeRoles, createRole);
router.get("/role", authMiddleware, authorizeRoles, getRoles);
router.get("/role/:id", authMiddleware, authorizeRoles, getRoleById);
router.put("/role/:id", authMiddleware, authorizeRoles, updateRole);
router.delete("/role/:id", authMiddleware, authorizeRoles, deleteRole);

export default router;
