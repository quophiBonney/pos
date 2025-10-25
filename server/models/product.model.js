import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, unique: true, required: true, trim: true },
    barcode: { type: String, unique: true, sparse: true },
    description: { type: String, default: "" },
    category: { type: String, required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    basePrice: { type: Number, required: true }, // before tax
    priceWithTax: { type: Number, required: true },
    cost: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 10 },
    status: {
      type: String,
      enum: [
        "available",
        "out of stock",
        "pending",
        "discounted",
        "discontinued",
      ],
      default: "available",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
