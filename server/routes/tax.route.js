import express from "express";
import {
  newTax,
  getTaxes,
  getTaxById,
  updateTax,
  deleteTax,
} from "../controllers/tax.controller.js";

const router = express.Router();

router.post("/taxes", newTax);
router.get("/taxes", getTaxes);
router.get("/taxes/:id", getTaxById);
router.put("/taxes/:id", updateTax);
router.delete("/taxes/:id", deleteTax);

export default router;
