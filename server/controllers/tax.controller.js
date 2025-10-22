import Taxes from "../models/tax.model.js";

export const newTax = async (req, res) => {
  try {
    const { name, code, rate, description, applicableCategories, isActive } =
      req.body;

    // ✅ Check required fields
    if (!name || !code || rate == null) {
      return res
        .status(400)
        .json({ message: "Name, code, and rate are required" });
    }

    // ✅ Prevent duplicates
    const existing = await Taxes.findOne({ $or: [{ name }, { code }] });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Tax with this name or code already exists" });
    }

    // ✅ Create new tax record
    const tax = await Taxes.create({
      name,
      code,
      rate,
      description,
      applicableCategories,
      isActive: isActive ?? true,
      createdBy: "6700f1b8b123456789abcd01", // Replace later with logged-in user ID
    });

    res.status(201).json({
      message: "Tax created successfully",
      data: tax,
    });
  } catch (error) {
    console.error("newTax error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getTaxes = async (req, res) => {
  try {
    const taxes = await Taxes.find();
    res.json(taxes);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const getTaxById = async (req, res) => {
  try {
    const tax = await Taxes.findById(req.params.id);
    if (!tax) return res.status(404).json({ message: "Tax not found" });
    res.json(tax);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const updateTax = async (req, res) => {
  try {
    const tax = await Taxes.findById(req.params.id);
    if (!tax) return res.status(404).json({ message: "Tax not found" });
    const { name, code, rate, description, applicableCategories, isActive } =
      req.body;
    tax.name = name || tax.name;
    tax.code = code || tax.code;
    tax.rate = rate != null ? rate : tax.rate;
    tax.description = description || tax.description;
    tax.applicableCategories = applicableCategories || tax.applicableCategories;
    tax.isActive = isActive != null ? isActive : tax.isActive;
    tax.updatedBy = req.user._id;
    await tax.save();
    res.json({ message: "Tax updated successfully", tax });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const deleteTax = async (req, res) => {
  try {
    const tax = await Taxes.findByIdAndDelete(req.params.id);
    if (!tax) return res.status(404).json({ message: "Tax not found" });
    res.json({ message: "Tax deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
