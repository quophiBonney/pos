import express from "express";
import multer from "multer";
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
} from "../controllers/product.controller.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/product", getProducts);

// Protected route: Only admins can create products
router.post("/product", createProduct);
router.delete("/product/:id", deleteProduct);
router.get("/product/barcode/:code", getBarcode);
// router.post("/product/import", importProducts);
router.post("/product/import", upload.single("file"), importProducts);
export default router;
