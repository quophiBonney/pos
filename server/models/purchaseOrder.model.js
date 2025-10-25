import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
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
    receivedDate: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "received", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Purchase Order", purchaseOrderSchema);
