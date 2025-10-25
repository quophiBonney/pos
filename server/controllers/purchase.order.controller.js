import PurchaseOrder from "../models/purchaseOrder.model.js"

export const createPurchaseOrder = async (req, res) => {
  try {
    const { product, supplier, quantityReceived, costPerUnit, notes, receivedBy } =
      req.body;
    const newPurchaseOrder = new PurchaseOrder({
      product,
      supplier,
        quantityReceived,
        costPerUnit,
        notes,
        receivedBy,
    });
    const savedOrder = await newPurchaseOrder.save();
    res.status(201).json(savedOrder);
  }
    catch (error) {
    console.error("Error creating purchase order:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
export const getPurchaseOrders = async (req, res) => {
    try {
    const purchaseOrders = await PurchaseOrder.find()
        .populate("product")
        .populate("supplier")
        .populate("receivedBy");
    res.status(200).json(purchaseOrders);
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    res.status(500).json({ message: "Server Error" });
  }     
};

export const updatePurchaseOrderStatus = async (req, res) => {
    try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
        id,
        { status
: status },
        { new: true }
    );;
    if (!updatedOrder) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }
    res.status(200).json(updatedOrder);
    } catch (error) {
    console.error("Error updating purchase order status:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getPurchaseOrderById = async (req, res) => {
    try {
    const { id } = req.params;
    const purchaseOrder = await PurchaseOrder.findById(id)
        .populate("product")
        .populate("supplier")
        .populate("receivedBy");
    if (!purchaseOrder) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }
    res.status(200).json(purchaseOrder);
    } catch (error) {
    console.error("Error fetching purchase order by ID:", error);
    res.status(500).json({ message: "Server Error" });
    }
};
export const deletePurchaseOrder = async (req, res) => {
    try {
    const { id } = req.params;
    const deletedOrder = await PurchaseOrder.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }
    res.status(200).json({ message: "Purchase Order deleted successfully" });
    }
    catch (error) {
    console.error("Error deleting purchase order:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getPurchaseOrdersBySupplier = async (req, res) => {
    try {
    const { supplierId } = req.params;
    const purchaseOrders = await PurchaseOrder.find({ supplier: supplierId })       
        .populate("product")
        .populate("supplier")
        .populate("receivedBy");
    res.status(200).json(purchaseOrders);
    } catch (error) {
    console.error("Error fetching purchase orders by supplier:", error);
    res.status(500).json({ message: "Server Error" });
  } 
};

export const getPurchaseOrdersByProduct = async (req, res) => {
    try {
    const { productId } = req.params;   
    const purchaseOrders = await PurchaseOrder.find({ product: productId })
        .populate("product")
        .populate("supplier")
        .populate("receivedBy");
    res.status(200).json(purchaseOrders);
    } catch (error) {
    console.error("Error fetching purchase orders by product:", error);
    res.status(500).json({ message: "Server Error" });
  }     
};

export const getPurchaseOrdersWithinDateRange = async (req, res) => {
    try {
    const { startDate, endDate } = req.query;   
    const purchaseOrders = await PurchaseOrder.find({
      receivedDate: {
        $gte: new Date(startDate),      
        $lte: new Date(endDate),
        },  
    })
        .populate("product")
        .populate("supplier")
        .populate("receivedBy");
    res.status(200).json(purchaseOrders);
    } catch (error) {
    console.error("Error fetching purchase orders within date range:", error);
    res.status(500).json({ message: "Server Error" });
  }     
};

