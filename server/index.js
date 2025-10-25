import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

//routes imports
import productRoutes from "./routes/product.route.js";
import authRoutes from "./routes/auth.route.js";
import permissionRoutes from "./routes/permission.route.js";
import roleRoutes from "./routes/role.route.js";
import supplierRoutes from "./routes/supplier.route.js";
import paymentRoutes from "./routes/payment.route.js";
import reportRoutes from "./routes/report.route.js";
import orderRoutes from "./routes/order.route.js";
import taxRoutes from "./routes/tax.route.js";
import categoryRoutes from "./routes/category.route.js";
import purchaseOrderRoutes from "./routes/purchase.order.route.js";


import connectToDB from "./config/db.connection.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
const app = express();
const port = process.env.PORT || 8000;

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

// ✅ Enable CORS globally
app.use(cors(corsOptions));

// ✅ Handle multipart/form-data first

// ✅ No need for app.options("*") — Express v5 breaks on this
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to DB
if (process.env.NODE_ENV !== "production") {
  connectToDB();
}

// ✅ Register routes
app.use("/api/", authRoutes);
app.use("/api/", productRoutes);
app.use("/api/", permissionRoutes);
app.use("/api/", roleRoutes);
app.use("/api/", supplierRoutes);
app.use("/api/", reportRoutes);
app.use("/api/", paymentRoutes);
app.use("/api/", orderRoutes);
app.use("/api/", taxRoutes);
app.use("/api/", categoryRoutes);
app.use("/api/", purchaseOrderRoutes);

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.send("POS Backend");
});

// ✅ Start server (locally)
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
}

export default app;
