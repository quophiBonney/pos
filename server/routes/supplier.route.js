import express from "express";
import {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
  importSuppliers,
  uploadSupplierFile,
} from "../controllers/suppler.controller.js";

const router = express.Router();

router.post("/supplier", createSupplier);
router.get("/supplier", getSuppliers);
router.put("/supplier/:id", updateSupplier);
router.delete("/supplier/:id", deleteSupplier);
router.post("/supplier/import", uploadSupplierFile, importSuppliers);
export default router;
