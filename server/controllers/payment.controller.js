import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";

// Create Payment
export const createPayment = async (req, res) => {
  try {
    const { orderId, amount, method, status } = req.body;

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) return res.status(400).json({ message: "Invalid order" });

    const payment = new Payment({ order: orderId, amount, method, status });
    await payment.save();

    res.status(201).json({ message: "Payment recorded", payment });
  } catch (error) {
    console.error("Create Payment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all payments
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("order");
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
