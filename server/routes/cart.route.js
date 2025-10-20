import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/cart", addToCart);
router.get("/cart", getCart);
router.patch("/cart/:id", updateCartItem);
router.delete("/cart/:id", removeFromCart);

export default router;
