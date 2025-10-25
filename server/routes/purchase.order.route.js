import express from "express";

import { createPurchaseOrder, getPurchaseOrders, getPurchaseOrdersWithinDateRange, getPurchaseOrdersByProduct, getPurchaseOrdersBySupplier, deletePurchaseOrder, getPurchaseOrderById, updatePurchaseOrderStatus } from "../controllers/purchase.order.controller.js";

const router = express.Router();

router.post("/purchase/order", createPurchaseOrder);
router.get("/purchase/order", getPurchaseOrders);
router.get("/purchase/order/date-range", getPurchaseOrdersWithinDateRange);
router.get("/purchase/order/:supplierId", getPurchaseOrdersBySupplier);
router.get("/purchase/order/:productId", getPurchaseOrdersByProduct);
router.get("/purchase/order/:id", getPurchaseOrderById);
router.put("/purchase/order/:id/status", updatePurchaseOrderStatus);
router.delete("/purchase/order/:id", deletePurchaseOrder);

export default router;