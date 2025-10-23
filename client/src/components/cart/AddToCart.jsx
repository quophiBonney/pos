import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { Toast } from "primereact/toast";
import api from "../../utils/api";

const AddToCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [scannedCode, setScannedCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);

  // invoiceReady => enables print button
  const [invoiceReady, setInvoiceReady] = useState(false);
  // invoiceData stores the last successful order items (used for printing)
  const [invoiceData, setInvoiceData] = useState([]);
  const toast = useRef(null);

  // Load Paystack script once
  useEffect(() => {
    const scriptId = "paystack-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.id = scriptId;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Scanner handlers
  const handleScan = async (data) => {
    if (!data || data === scannedCode) return;
    setScannedCode(data);

    try {
      const response = await api.get(`/product/barcode/${data}`);
      const product = response.data?.data;

      if (product) {
        setCartItems((prev) => {
          const existing = prev.find((it) => it.product._id === product._id);
          if (existing) {
            return prev.map((it) =>
              it.product._id === product._id
                ? { ...it, quantity: it.quantity + 1 }
                : it
            );
          }
          return [...prev, { product, quantity: 1 }];
        });

        toast.current.show({
          severity: "success",
          summary: "Added to Cart",
          detail: `${product.name} added successfully.`,
          life: 3000,
        });
      } else {
        toast.current.show({
          severity: "warn",
          summary: "Not Found",
          detail: "No product found for this barcode.",
          life: 3000,
        });
      }
    } catch (err) {
      console.error("Error processing barcode:", err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Could not process the scanned barcode.",
        life: 3000,
      });
    } finally {
      setTimeout(() => setScannedCode(""), 1500);
    }
  };

  const handleError = (err) => console.error("Scanner error:", err);

  // Quantity controls
  const incrementQuantity = (id) =>
    setCartItems((prev) =>
      prev.map((it) =>
        it.product._id === id ? { ...it, quantity: it.quantity + 1 } : it
      )
    );

  const decrementQuantity = (id) =>
    setCartItems((prev) =>
      prev
        .map((it) =>
          it.product._id === id
            ? { ...it, quantity: Math.max(1, it.quantity - 1) }
            : it
        )
        .filter((it) => it.quantity > 0)
    );

  const removeFromCart = (id) =>
    setCartItems((prev) => prev.filter((it) => it.product._id !== id));

  // totals
  const calculateCartTotal = (items) =>
    items.reduce((s, it) => s + it.product.price * it.quantity, 0);

  const calculateCartTotalFixed = (items) =>
    calculateCartTotal(items).toFixed(2);

  // Paystack payment
  const handlePaystackPayment = () => {
    if (cartItems.length === 0) {
      toast.current.show({
        severity: "warn",
        summary: "Cart Empty",
        detail: "Please add items to cart before proceeding.",
        life: 3000,
      });
      return;
    }

    const totalAmount = parseFloat(calculateCartTotalFixed(cartItems));
    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

    if (!paystackKey) {
      toast.current.show({
        severity: "error",
        summary: "Configuration Error",
        detail: "Missing Paystack public key in .env file.",
        life: 3000,
      });
      return;
    }

    if (!window.PaystackPop) {
      toast.current.show({
        severity: "error",
        summary: "Paystack Error",
        detail: "Paystack script not loaded. Please reload the page.",
        life: 3000,
      });
      return;
    }

    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email: "customer@email.com",
      amount: totalAmount * 100,
      currency: "GHS",
      ref: "PSK_" + Date.now(),
      callback: (response) => handleOrderAfterPayment(response),
      onClose: () => console.log("Paystack modal closed"),
    });

    handler.openIframe();
  };

  // Unified order creation after payment
  const handleOrderAfterPayment = async (response) => {
    try {
      setLoading(true);

      // Keep a snapshot of items for invoice BEFORE clearing cart
      const itemsForInvoice = cartItems.map((it) => ({
        productId: it.product._id,
        name: it.product.name,
        price: it.product.price,
        quantity: it.quantity,
        subtotal: it.product.price * it.quantity,
        product: it.product, // keep original product for printing image / name if needed
      }));

      const totalAmount = parseFloat(calculateCartTotalFixed(cartItems));

      const orderData = {
        paymentMethod,
        transactionRef: response.reference,
        status: "paid",
        items: itemsForInvoice.map((i) => ({
          productId: i.productId,
          price: i.price,
          quantity: i.quantity,
        })),
        createdAt: new Date(),
      };

      const res = await api.post("/order", orderData);

      if (res.status === 200 || res.status === 201) {
        toast.current.show({
          severity: "success",
          summary: "Payment Successful",
          detail: `${paymentMethod} payment completed successfully.`,
          life: 3000,
        });

        // Store invoice data and enable print button.
        setInvoiceData(itemsForInvoice);
        setInvoiceReady(true);

        // Clear cart so next sale can start cleanly
        setCartItems([]);
        setPaymentMethod("");
      } else {
        toast.current.show({
          severity: "error",
          summary: "Database Error",
          detail: "Order not saved. Please check the backend.",
          life: 3000,
        });
      }
    } catch (err) {
      console.error("Error creating order:", err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.response?.data?.message || err.message,
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Cash payment (uses same order flow, with fake reference)
  const handleCashPayment = async () => {
    if (cartItems.length === 0) {
      toast.current.show({
        severity: "warn",
        summary: "Cart Empty",
        detail: "Please add items to cart before proceeding.",
        life: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      // call same handler with a pseudo response object
      await handleOrderAfterPayment({ reference: "CASH_" + Date.now() });
    } catch (err) {
      console.error("Cash payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Print invoice (uses invoiceData)
  const handlePrintInvoice = () => {
    if (!invoiceReady || invoiceData.length === 0) return;

    const invoiceTotal = calculateCartTotalFixed(invoiceData);

    // Build printable HTML
    const win = window.open("", "_blank");
    if (!win) {
      toast.current.show({
        severity: "error",
        summary: "Popup Blocked",
        detail: "Please allow popups to print invoice.",
        life: 3000,
      });
      return;
    }

    const html = `
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
            h1 { text-align: center; }
            .meta { margin-bottom: 12px; }
            table { width:100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f4f4f4; }
            .right { text-align: right; }
            .total { font-weight: bold; font-size: 1.1rem; }
            .footer { margin-top: 20px; text-align:center; color:#555; }
          </style>
        </head>
        <body>
          <h1><strong>Consol Shop</strong></h1>
          <div class="meta">
            <div><strong>Date:</strong> ${new Date().toLocaleString()}</div>
            <div><strong>Payment:</strong> ${paymentMethod} </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData
                .map(
                  (it) => `
                <tr>
                  <td>${escapeHtml(it.name)}</td>
                  <td>${it.quantity}</td>
                  <td>Total = GHS ${Number(it.price).toFixed(2)}</td>
                  <td>GHS ${Number(it.subtotal).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div style="margin-top:12px; text-align: right;" class="total">
            Total: GHS ${Number(invoiceTotal).toFixed(2)}
          </div>

          <div class="footer">Thank you for your purchase!</div>
        </body>
      </html>
    `;

    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    // give browser a tick to render
    setTimeout(() => win.print(), 250);
  };

  // small helper to avoid XSS in inserted HTML
  function escapeHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  return (
    <>
      <Toast ref={toast} position="top-right" />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 4,
          p: { xs: 2, md: 4 },
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #f9fafb 0%, #f3f4f6 50%, #e5e7eb 100%)",
        }}
      >
        {/* Scanner */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            backgroundColor: "#fff",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            p: { xs: 3, md: 5 },
          }}
        >
          <Typography variant="h5" fontWeight="bold" color="primary" mb={3}>
            Scan Product Barcode
          </Typography>

          <Box
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: 420,
              height: 340,
              borderRadius: 3,
              overflow: "hidden",
              border: "3px solid #3b82f6",
            }}
          >
            <BarcodeScannerComponent
              width="100%"
              height="100%"
              onUpdate={(err, result) => {
                if (result) handleScan(result.text);
                else if (err && err.name !== "NotFoundException")
                  handleError(err);
              }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" mt={3}>
            Align the barcode inside the frame to scan automatically.
          </Typography>
        </Box>

        {/* Cart */}
        <Box
          sx={{
            backgroundColor: "#fff",
            borderRadius: 4,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            p: { xs: 3, md: 5 },
          }}
        >
          <Typography
            variant="h6"
            display="flex"
            alignItems="center"
            gap={1}
            fontWeight="bold"
            mb={2}
            color="primary"
          >
            <ShoppingCartIcon color="primary" /> Shopping Cart
          </Typography>

          {/* PRINT BUTTON: always visible, disabled until invoiceReady */}
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            sx={{ mb: 2 }}
            startIcon={<PrintIcon />}
            disabled={!invoiceReady}
            onClick={handlePrintInvoice}
          >
            Print Invoice
          </Button>

          <Divider sx={{ mb: 2 }} />

          {cartItems.length === 0 ? (
            <Typography
              color="text.secondary"
              align="center"
              mt={8}
              fontStyle="italic"
            >
              Cart is empty. Scan a product to add.
            </Typography>
          ) : (
            <>
              <Box sx={{ maxHeight: "60vh", overflowY: "auto", pr: 1 }}>
                {cartItems.map((item) => (
                  <Paper
                    key={item.product._id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                      p: 1.5,
                      border: "1px solid #e5e7eb",
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src={item.product?.productImage || ""}
                        alt={item.product?.name || "Unknown"}
                        sx={{ width: 48, height: 48 }}
                      />
                      <Box>
                        <Typography fontWeight="500">
                          {item.product?.name || "Unknown Product"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          GHS {item.product?.price?.toFixed(2) || "0.00"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => decrementQuantity(item.product._id)}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography>{item.quantity}</Typography>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => incrementQuantity(item.product._id)}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => removeFromCart(item.product._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />
              <Typography
                variant="h6"
                sx={{ textAlign: "right", fontWeight: "bold" }}
              >
                Total: GHS {calculateCartTotalFixed(cartItems)}
              </Typography>

              <FormControl fullWidth sx={{ mt: 3 }}>
                <InputLabel>Select Payment Method</InputLabel>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  label="Select Payment Method"
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="mobile money">Mobile Money</MenuItem>
                </Select>
              </FormControl>

              {paymentMethod === "mobile money" && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 3 }}
                  onClick={handlePaystackPayment}
                  disabled={loading}
                >
                  Pay with Mobile Money
                </Button>
              )}

              {paymentMethod === "cash" && (
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  sx={{ mt: 3 }}
                  onClick={handleCashPayment}
                  disabled={loading}
                >
                  Mark as Paid (Cash)
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default AddToCart;
