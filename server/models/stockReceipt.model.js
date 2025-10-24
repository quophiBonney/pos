import mongoose from "mongoose";

const stockReceiptSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    quantityReceived: { type: Number, required: true },
    costPerUnit: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    receivedDate: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("StockReceipt", stockReceiptSchema);
