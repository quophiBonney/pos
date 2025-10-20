import express from "express";
import { createOrder, getOrders } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/order", createOrder)
router.get("/order", getOrders);


export default router;
