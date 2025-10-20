import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["daily", "weekly", "monthly", "custom"],
      required: true,
    },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // manager/admin
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    salesTotal: { type: Number, required: true },
    transactionsCount: { type: Number, required: true },
    topProducts: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        totalSold: Number,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
