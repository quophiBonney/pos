import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

router.get("/category", getCategories);
router.post("/category", createCategory);
router.delete("/category/:id", deleteCategory);
router.put("/category/:id", updateCategory);

export default router;
