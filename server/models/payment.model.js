import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    method: {
      type: String,
      enum: ["cash", "card", "mobile_money"],
      required: true,
    },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
    transactionId: { type: String, unique: true, sparse: true }, // for gateways
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
