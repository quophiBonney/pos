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
      price: item.price, // snapshot at purchase
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
