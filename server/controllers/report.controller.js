import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";

// Sales report
export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const report = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" }
        }
      }
    ]);

    res.json(report[0] || { totalOrders: 0, totalRevenue: 0 });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Payment summary
export const getPaymentSummary = async (req, res) => {
  try {
    const summary = await Payment.aggregate([
      { $group: { _id: "$status", total: { $sum: "$amount" } } }
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
