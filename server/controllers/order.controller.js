import Order from "../models/order.model.js";
import Product from "../models/product.model.js"; // ✅ added to access product stock

export const createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, transactionRef, user } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in the order." });
    }

    // 🧮 Map items correctly for the schema
    const orderItems = items.map((item) => ({
      product: item.productId, // ✅ matches schema
      quantity: item.quantity,
      price: item.price || item.basePrice, // snapshot at purchase
    }));

    // 🧮 Calculate totals
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discount = 0;
    const tax = 0;
    const total = subtotal - discount + tax;

    // 🧾 Create new order
    const order = new Order({
      user: user || "6700f1b8b123456789abcd01", // ⚠️ replace with logged-in user ID later
      items: orderItems,
      subtotal,
      discount,
      tax,
      total,
      paymentMethod,
      transactionRef,
      status: "paid", // ✅ matches enum
    });

    await order.save();

    // 🧩 NEW LOGIC: Deduct stock from products after successful order
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(product.stock - item.quantity, 0); // prevent negative stock
        await product.save();
      }
    }

    res.status(201).json({
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email") // populate user details
      .populate("items.product", "name price"); // populate product details in items
    res.json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};

// ✅ New: Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Total products
    const totalProducts = await Product.countDocuments();

    // Total users
    const User = (await import("../models/user.model.js")).default;
    const totalUsers = await User.countDocuments();

    // Total sales (orders)
    const totalOrders = await Order.countDocuments();

    // Total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

// ✅ New: Get sales data for charts
export const getSalesData = async (req, res) => {
  try {
    const { period = "daily" } = req.query; // daily, weekly, monthly, yearly

    let groupBy;
    let dateFormat;

    switch (period) {
      case "daily":
        groupBy = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
        dateFormat = "%Y-%m-%d";
        break;
      case "weekly":
        groupBy = {
          $dateToString: { format: "%Y-%U", date: "$createdAt" },
        };
        dateFormat = "%Y-%U";
        break;
      case "monthly":
        groupBy = {
          $dateToString: { format: "%Y-%m", date: "$createdAt" },
        };
        dateFormat = "%Y-%m";
        break;
      case "yearly":
        groupBy = {
          $dateToString: { format: "%Y", date: "$createdAt" },
        };
        dateFormat = "%Y";
        break;
      default:
        groupBy = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
        dateFormat = "%Y-%m-%d";
    }

    const salesData = await Order.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      period,
      data: salesData,
    });
  } catch (error) {
    console.error("Sales Data Error:", error);
    res.status(500).json({
      message: "Failed to fetch sales data",
      error: error.message,
    });
  }
};
