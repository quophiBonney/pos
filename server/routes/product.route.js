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
  receiveStock,
  getStockHistory,
} from "../controllers/product.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/product", getProducts);

// Protected route: Only admins can create products
router.post("/product", createProduct);
router.delete("/product/:id", deleteProduct);
router.get("/product/barcode/:code", getBarcode);
// router.post("/product/import", importProducts);
router.post("/product/import", upload.single("file"), importProducts);
router.post("/product/:id/receive-stock", receiveStock);
router.get("/product/:id/stock-history", getStockHistory);
export default router;
