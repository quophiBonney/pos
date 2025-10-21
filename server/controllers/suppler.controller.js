import Supplier from "../models/supplier.model.js";
import multer from "multer";
import xlsx from "xlsx";

// -------------------- MULTER SETUP --------------------
// Use memory storage to avoid file system writes (Vercel is read-only)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to handle file upload
export const uploadSupplierFile = upload.single("file");

// -------------------- CONTROLLERS --------------------

// Create Supplier
export const createSupplier = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      contactPersonName,
      contactPersonPhone,
    } = req.body;

    const supplier = new Supplier({
      name,
      email,
      phone,
      address,
      contactPersonName,
      contactPersonPhone,
    });

    await supplier.save();
    res.status(201).json({
      message: "Supplier created successfully",
      supplier,
    });
  } catch (error) {
    console.error("Create Supplier Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all Suppliers
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get single Supplier
export const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Supplier
export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });

    res.json({ message: "Supplier updated", supplier });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Supplier
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });

    res.json({ message: "Supplier deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Import Suppliers from Excel (Memory-based)
export const importSuppliers = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Read uploaded Excel file from memory
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let addedCount = 0;
    let skippedCount = 0;

    for (const row of data) {
      const {
        name,
        email,
        phone,
        address,
        contactPersonName,
        contactPersonPhone,
      } = row;

      if (!name || !email || !phone) {
        skippedCount++;
        continue;
      }

      const existing = await Supplier.findOne({
        $or: [{ email }, { phone }],
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      await Supplier.create({
        name,
        email,
        phone,
        address,
        contactPersonName,
        contactPersonPhone,
      });

      addedCount++;
    }

    res.json({
      message: "Import completed successfully",
      added: addedCount,
      skipped: skippedCount,
    });
  } catch (error) {
    console.error("Import Suppliers Error:", error);
    res.status(500).json({ message: "Server error during import" });
  }
};
