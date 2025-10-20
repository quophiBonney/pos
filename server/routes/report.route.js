import express from "express";
import { getSalesReport, getPaymentSummary } from "../controllers/report.controller.js";

const router = express.Router();

router.get("/sales/report", getSalesReport);
router.get("/payment/report", getPaymentSummary)


export default router;
