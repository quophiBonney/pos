import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contactPersonName: { type: String, default: "" },
    contactPersonPhone: { type: String, default: "" },
    phone: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive", "terminated"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Supplier", supplierSchema);
