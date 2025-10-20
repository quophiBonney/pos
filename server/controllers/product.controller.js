import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";

const upload = multer({ dest: "uploads/" });
export const uploadProductFile = upload.single("file");
/**
 * Helper - upload buffer to Cloudinary
 */
const uploadBufferToCloudinary = async (buffer, mimetype) => {
  const base64 = buffer.toString("base64");
  const dataURI = `data:${mimetype};base64,${base64}`;
  return cloudinary.uploader.upload(dataURI, {
    folder: "pos_products",
    resource_type: "image",
  });
};

/**
 * GET /api/products
 */
export const getProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "25", 10), 1);
    const q = req.query.q?.trim();
    const filter = {};

    if (q) {
      const re = new RegExp(q, "i");
      filter.$or = [{ name: re }, { sku: re }, { barcode: re }];
    }
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.supplier) filter.supplier = req.query.supplier;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("supplier")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      data: products,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getProducts error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: err.message });
  }
};

/**
 * GET /api/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("supplier");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("getProductById error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: err.message });
  }
};
export const createProduct = async (req, res) => {
  let uploaded = null;

  try {
    let productsData = req.body;

    // If body is JSON string (from form-data), parse it
    if (typeof productsData === "string") {
      productsData = JSON.parse(productsData);
    }

    // ✅ Handle array of products
    if (Array.isArray(productsData)) {
      const preparedProducts = [];

      for (const data of productsData) {
        const {
          name,
          sku,
          barcode,
          description = "",
          category,
          supplier,
          price,
          cost,
          stock = 0,
          reorderLevel = 10,
          status = "active",
        } = data;

        if (!name || !sku || !category || price == null || cost == null) {
          return res.status(400).json({
            message:
              "Each product must have name, sku, category, price and cost",
          });
        }

        const priceNum = parseFloat(price);
        const costNum = parseFloat(cost);
        if (Number.isNaN(priceNum) || Number.isNaN(costNum)) {
          return res
            .status(400)
            .json({ message: "price and cost must be valid numbers" });
        }

        // Ensure SKU/barcode uniqueness before inserting
        const existing = await Product.findOne({ $or: [{ sku }, { barcode }] });
        if (existing) {
          return res.status(409).json({
            message: `Product with SKU or barcode '${
              sku || barcode
            }' already exists`,
          });
        }

        preparedProducts.push({
          name: name.trim(),
          sku: sku.trim(),
          barcode: barcode ? barcode.trim() : undefined,
          description,
          category,
          supplier: supplier || undefined,
          price: priceNum,
          cost: costNum,
          stock: Number(stock),
          reorderLevel: Number(reorderLevel),
          status,
        });
      }

      const createdProducts = await Product.insertMany(preparedProducts, {
        ordered: false,
      });
      const populated = await Product.find({
        _id: { $in: createdProducts.map((p) => p._id) },
      }).populate("supplier");
      return res
        .status(201)
        .json({ message: "Products created successfully", data: populated });
    }

    // ✅ Handle single product object
    const {
      name,
      sku,
      barcode,
      description = "",
      category,
      supplier,
      price,
      cost,
      stock = 0,
      reorderLevel = 10,
      status = "active",
    } = productsData;

    if (!name || !sku || !category || price == null || cost == null) {
      return res
        .status(400)
        .json({ message: "name, sku, category, price and cost are required" });
    }

    const priceNum = parseFloat(price);
    const costNum = parseFloat(cost);
    if (Number.isNaN(priceNum) || Number.isNaN(costNum)) {
      return res
        .status(400)
        .json({ message: "price and cost must be valid numbers" });
    }

    const dupFilter = { $or: [{ sku }] };
    if (barcode) dupFilter.$or.push({ barcode });
    const existing = await Product.findOne(dupFilter);
    if (existing) {
      return res.status(409).json({ message: "SKU or barcode already exists" });
    }

    if (req.file) {
      uploaded = await uploadBufferToCloudinary(
        req.file.buffer,
        req.file.mimetype
      );
    }

    const product = new Product({
      name: name.trim(),
      sku: sku.trim(),
      barcode: barcode ? barcode.trim() : undefined,
      description,
      category,
      supplier: supplier || undefined,
      price: priceNum,
      cost: costNum,
      stock: Number(stock),
      reorderLevel: Number(reorderLevel),
      status,
      productImage: uploaded?.secure_url || "",
      productImageId: uploaded?.public_id || "",
    });

    await product.save();
    const populated = await Product.findById(product._id).populate("supplier");
    return res
      .status(201)
      .json({ message: "Product created successfully", data: populated });
  } catch (err) {
    if (uploaded?.public_id) {
      try {
        await cloudinary.uploader.destroy(uploaded.public_id, {
          resource_type: "image",
        });
      } catch (cleanupErr) {
        console.error("Failed to cleanup uploaded image on error:", cleanupErr);
      }
    }

    console.error("createProduct error:", err);
    return res
      .status(500)
      .json({ message: "Failed to create product(s)", error: err.message });
  }
};
export const updateProduct = async (req, res) => {
  let newUpload = null;
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (req.body.sku && req.body.sku !== product.sku) {
      const exists = await Product.findOne({ sku: req.body.sku });
      if (exists)
        return res.status(409).json({ message: "SKU already in use" });
    }
    if (req.body.barcode && req.body.barcode !== product.barcode) {
      const existsB = await Product.findOne({ barcode: req.body.barcode });
      if (existsB)
        return res.status(409).json({ message: "Barcode already in use" });
    }

    if (req.file) {
      newUpload = await uploadBufferToCloudinary(
        req.file.buffer,
        req.file.mimetype
      );
    }

    const updates = {};
    const updatable = [
      "name",
      "sku",
      "barcode",
      "description",
      "category",
      "supplier",
      "price",
      "cost",
      "stock",
      "reorderLevel",
      "status",
    ];
    updatable.forEach((k) => {
      if (req.body[k] !== undefined) {
        if (["price", "cost"].includes(k)) {
          const val = parseFloat(req.body[k]);
          if (Number.isNaN(val)) throw new Error(`${k} must be a number`);
          updates[k] = val;
        } else if (["stock", "reorderLevel"].includes(k)) {
          updates[k] = Number(req.body[k]);
        } else {
          updates[k] = req.body[k];
        }
      }
    });

    if (newUpload) {
      updates.productImage = newUpload.secure_url;
      updates.productImageId = newUpload.public_id;
    }

    const updated = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("supplier");

    if (newUpload && product.productImageId) {
      try {
        await cloudinary.uploader.destroy(product.productImageId, {
          resource_type: "image",
        });
      } catch (delErr) {
        console.error("Failed to delete old Cloudinary image:", delErr);
      }
    }

    return res.json(updated);
  } catch (err) {
    if (newUpload?.public_id) {
      try {
        await cloudinary.uploader.destroy(newUpload.public_id, {
          resource_type: "image",
        });
      } catch (cleanupErr) {
        console.error(
          "Failed to cleanup newly uploaded image after error:",
          cleanupErr
        );
      }
    }

    console.error("updateProduct error:", err);
    return res
      .status(500)
      .json({ message: "Failed to update product", error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.productImageId) {
      try {
        await cloudinary.uploader.destroy(product.productImageId, {
          resource_type: "image",
        });
      } catch (err) {
        console.error("Failed to delete Cloudinary image for product:", err);
      }
    }

    await product.deleteOne();
    return res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("deleteProduct error:", err);
    return res
      .status(500)
      .json({ message: "Failed to delete product", error: err.message });
  }
};
export const getBarcode = async (req, res) => {
  try {
    const product = await Product.findOne({ sku: req.params.code });
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ data: product });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
export const importProducts = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Read uploaded file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let addedCount = 0;
    let skippedCount = 0;

    for (const row of data) {
      const {
        name,
        sku,
        barcode,
        description,
        category,
        supplier,
        price,
        cost,
        stock,
        reorderLevel,
        status,
      } = row;

      // Skip invalid rows
      if (!name || !sku || !barcode) {
        skippedCount++;
        continue;
      }

      // Check for duplicates
      const existing = await Product.findOne({
        $or: [{ sku }, { barcode }],
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      // Save new supplier
      await Product.create({
        name,
        sku,
        barcode,
        description,
        category,
        supplier,
        price,
        cost,
        stock,
        reorderLevel,
        status,
      });

      addedCount++;
    }

    // Delete uploaded file after processing
    fs.unlinkSync(req.file.path);

    res.json({
      message: "Import completed successfully",
      added: addedCount,
      skipped: skippedCount,
    });
  } catch (error) {
    console.error("Import Product Error:", error);
    res.status(500).json({ message: "Server error during import" });
  }
};
