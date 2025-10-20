import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // e.g., "admin", "cashier"
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    // Each role can have multiple permissions
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Role", roleSchema);
