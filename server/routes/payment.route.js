import express from "express";
import { createPayment, getPayments } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/payment", createPayment);
router.get("/payment", getPayments);


export default router;
