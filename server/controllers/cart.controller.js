import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// ✅ Get active cart for user
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: "68e7dee469d4b71029272c39",
      status: "active",
    }).populate("items.product");

    if (!cart) {
      return res.status(200).json({ message: "Cart is empty", items: [] });
    }

    res.json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
};

// ✅ Add item to cart
// export const addToCart = async (req, res) => {
//   try {
//     const { productId, quantity } = req.body;

//     // Check product
//     const product = await Product.findById(productId);
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     // Find active cart or create one
//     let cart = await Cart.findOne({ user: req.user.id, status: "active" });

//     if (!cart) {
//       cart = new Cart({ user: req.user.id, items: [] });
//     }

//     // Check if product already exists in cart
//     const existingItem = cart.items.find((item) => item.product.toString() === productId);

//     if (existingItem) {
//       existingItem.quantity += quantity;
//     } else {
//       cart.items.push({ product: productId, quantity });
//     }

//     await cart.save();
//     res.json(cart);
//   } catch (error) {
//     res.status(500).json({ message: "Error adding to cart", error: error.message });
//   }
// };

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: "Product ID and quantity are required" });
    }

    // Temporary test user (replace later with req.user.id)
    const testUserId = "68e7dee469d4b71029272c39"; // <- replace with a real user _id from MongoDB

    // Find an active cart for the user
    let cart = await Cart.findOne({ user: testUserId, status: "active" });

    if (!cart) {
      cart = new Cart({ user: testUserId, items: [] });
    }

    // Check if product already exists in cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    res
      .status(201)
      .json({ message: "Product added to cart successfully", cart });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error adding to cart", error: error.message });
  }
};

// ✅ Update quantity
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({
      user: "68e7dee469d4b71029272c39",
      status: "active",
    });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating cart item", error: error.message });
  }
};

// ✅ Remove item
export const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params; // ✅ use params instead of body

    let cart = await Cart.findOne({
      user: "68e7dee469d4b71029272c39",
      status: "active",
    });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => item.product.toString() !== id);

    await cart.save();
    res.json({ message: "Item removed successfully", cart });
  } catch (error) {
    res.status(500).json({
      message: "Error removing item",
      error: error.message,
    });
  }
};

// ✅ Checkout
export const checkoutCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      user: "68e7dee469d4b71029272c39",
      status: "active",
    });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    cart.status = "checked_out";
    await cart.save();

    // ✅ At this point, you can create an Order model instance here too
    // Example: await Order.create({ user: req.user.id, items: cart.items });

    res.json({ message: "Checkout successful", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during checkout", error: error.message });
  }
};
