import express from "express";
import {
  createOrder,
  getOrders,
  getDashboardStats,
  getSalesData,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/order", createOrder);
router.get("/order", getOrders);
router.get("/order/dashboard-stats", getDashboardStats);
router.get("/order/sales-data", getSalesData);

export default router;
