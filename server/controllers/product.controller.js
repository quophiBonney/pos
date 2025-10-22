import Product from "../models/product.model.js";
import Taxes from "../models/tax.model.js";
import xlsx from "xlsx";

/**
 * Helper: calculate price with tax
 */
const calculatePriceWithTax = async (category, basePrice) => {
  const tax = await Taxes.findOne({
    applicableCategories: { $in: [category] },
    isActive: true,
  });
  if (!tax) return basePrice; // no tax found
  const rate = Number(tax.rate) || 0;
  return basePrice + (basePrice * rate) / 100;
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
    res.status(500).json({
      message: "Failed to fetch products",
      error: err.message,
    });
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
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

/**
 * POST /api/products
 */
export const createProduct = async (req, res) => {
  try {
    let data = req.body;
    if (typeof data === "string") data = JSON.parse(data);

    // handle bulk create
    if (Array.isArray(data)) {
      const validProducts = [];
      for (const p of data) {
        if (
          !p.name ||
          !p.sku ||
          !p.category ||
          p.price == null ||
          p.cost == null
        )
          continue;

        const existing = await Product.findOne({
          $or: [{ sku: p.sku }, { barcode: p.barcode }],
        });
        if (!existing) {
          const basePrice = parseFloat(p.price);
          const priceWithTax = await calculatePriceWithTax(
            p.category,
            basePrice
          );

          validProducts.push({
            name: p.name.trim(),
            sku: p.sku.trim(),
            barcode: p.barcode?.trim(),
            description: p.description || "",
            category: p.category,
            supplier: p.supplier || undefined,
            basePrice,
            priceWithTax,
            cost: parseFloat(p.cost),
            stock: Number(p.stock || 0),
            reorderLevel: Number(p.reorderLevel || 10),
            status: p.status || "available",
          });
        }
      }

      const created = await Product.insertMany(validProducts, {
        ordered: false,
      });
      return res.status(201).json({
        message: "Products created successfully with tax applied",
        data: created,
      });
    }

    // handle single create
    const { name, sku, barcode, category, price, cost } = data;
    if (!name || !sku || !category || price == null || cost == null) {
      return res.status(400).json({
        message: "name, sku, category, price and cost are required",
      });
    }

    const existing = await Product.findOne({ $or: [{ sku }, { barcode }] });
    if (existing) {
      return res.status(409).json({ message: "SKU or barcode already exists" });
    }

    const basePrice = parseFloat(price);
    const priceWithTax = await calculatePriceWithTax(category, basePrice);

    const product = await Product.create({
      ...data,
      basePrice,
      priceWithTax,
      cost: parseFloat(cost),
    });

    const populated = await Product.findById(product._id).populate("supplier");
    res.status(201).json({
      message: "Product created successfully with tax applied",
      data: populated,
    });
  } catch (err) {
    console.error("createProduct error:", err);
    res.status(500).json({ message: "Failed to create product(s)" });
  }
};

/**
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Recalculate tax if price or category changes
    if (req.body.price || req.body.category) {
      const basePrice = parseFloat(req.body.price ?? product.basePrice);
      const category = req.body.category ?? product.category;
      req.body.basePrice = basePrice;
      req.body.priceWithTax = await calculatePriceWithTax(category, basePrice);
    }

    const updated = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("supplier");

    res.json(updated);
  } catch (err) {
    console.error("updateProduct error:", err);
    res.status(500).json({ message: "Failed to update product" });
  }
};
export const getBarcode = async (req, res) => {
  try {
    const product = await Product.findOne({ sku: req.params.code });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ data: product });
  } catch (err) {
    console.error("getBarcode error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const importProducts = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    let added = 0;
    let skipped = 0;

    for (const row of data) {
      const { name, sku, barcode } = row;
      if (!name || !sku || !barcode) {
        skipped++;
        continue;
      }

      const existing = await Product.findOne({ $or: [{ sku }, { barcode }] });
      if (existing) {
        skipped++;
        continue;
      }

      await Product.create(row);
      added++;
    }

    res.json({ message: "Import completed", added, skipped });
  } catch (err) {
    console.error("importProducts error:", err);
    res.status(500).json({ message: "Import failed", error: err.message });
  }
};
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("deleteProduct error:", err);
    res.status(500).json({ message: "Failed to delete product" });
  }
};
