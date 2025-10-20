import express from "express";
import { createPermission, getPermissions } from "../controllers/permission.controller.js";

const router = express.Router();

router.post("/permission", createPermission);
router.get("/permission", getPermissions);

export default router;
