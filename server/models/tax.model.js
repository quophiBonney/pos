import mongoose from "mongoose";

const taxSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      // stored as percentage — e.g. 15 means 15%
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    applicableCategories: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Taxes", taxSchema);
