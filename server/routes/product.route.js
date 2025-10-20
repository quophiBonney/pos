import express from "express";
import {
  authMiddleware,
  authorizeRoles,
} from "../middleware/auth.mddleware.js";
import {
  createProduct,
  getProducts,
  deleteProduct,
  getBarcode,
  importProducts,
  uploadProductFile,
} from "../controllers/product.controller.js";

const router = express.Router();

// Public route (no login required)
router.get("/product", getProducts);

// Protected route: Only admins can create products
router.post("/product", createProduct);
router.delete("/product/:id", deleteProduct);
router.get("/product/barcode/:code", getBarcode);
router.post("/product/import", uploadProductFile, importProducts);
export default router;
