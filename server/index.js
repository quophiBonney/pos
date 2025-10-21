import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";

//routes imports
import productRoutes from "./routes/product.route.js";
import authRoutes from "./routes/auth.route.js";
import permissionRoutes from "./routes/permission.route.js";
import roleRoutes from "./routes/role.route.js";
import supplierRoutes from "./routes/supplier.route.js";
import cartRoutes from "./routes/cart.route.js";
import paymentRoutes from "./routes/payment.route.js";
import reportRoutes from "./routes/report.route.js";
import orderRoutes from "./routes/order.route.js";

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

// ✅ No need for app.options("*") — Express v5 breaks on this
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const upload = multer();
app.use(upload.none());

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
app.use("/api/", cartRoutes);
app.use("/api/", reportRoutes);
app.use("/api/", paymentRoutes);
app.use("/api/", orderRoutes);

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

// ✅ Export for Vercel
export default app;
