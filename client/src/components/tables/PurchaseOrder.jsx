import { useState, useEffect, useRef } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import api from "../../utils/api";

const PurchaseOrdersTable = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [statuses] = useState(["pending", "received", "cancelled"]);
  const [visible, setVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    product: "",
    supplier: "",
    quantityReceived: "",
    costPerUnit: "",
    receivedDate: "",
    notes: "",
    receivedBy: "",
    status: "pending",
  });

  const toast = useRef(null);

  // ✅ Fetch all purchase orders
  const fetchPurchaseOrders = async () => {
    try {
      const res = await api.get("/purchase/order");
      setPurchaseOrders(res.data || []);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch purchase orders",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch products & suppliers & user
  const fetchProductsAndSuppliers = async () => {
    try {
      const [productRes, supplierRes] = await Promise.all([
        api.get("/product"),
        api.get("/supplier"),
      ]);
      setProducts(productRes.data.data || []);
      setSuppliers(supplierRes.data || []);

      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) setUser(storedUser);
    } catch (err) {
      console.error("Error fetching products or suppliers:", err);
    }
  };

  useEffect(() => {
    fetchProductsAndSuppliers();
    fetchPurchaseOrders();
    initFilters();
  }, []);

  // ---------------- FILTERS ----------------
  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      status: {
        operator: FilterOperator.OR,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
    });
    setGlobalFilterValue("");
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const clearFilter = () => {
    initFilters();
  };

  // ---------------- UTILITIES ----------------
  const getSeverity = (status) => {
    switch (status?.toLowerCase()) {
      case "received":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------- CRUD HANDLERS ----------------
const handleSavePurchaseOrder = async () => {
  try {
    // ✅ Get logged-in user (assuming you store it in localStorage after login)
    const user = JSON.parse(localStorage.getItem("user"));
    const receivedBy = user?.id;


    const payload = { ...formData, receivedBy};

    if (editingOrder) {
      // ✅ Update existing purchase order
      await api.put(`/purchase/order/${editingOrder._id}`, payload);
      toast.current.show({
        severity: "success",
        summary: "Updated",
        detail: "Purchase order updated successfully",
        life: 3000,
      });
    } else {
      // ✅ Create new purchase order
      await api.post("/purchase/order", payload);
      toast.current.show({
        severity: "success",
        summary: "Created",
        detail: "Purchase order created successfully",
        life: 3000,
      });
    }

    setVisible(false);
    setEditingOrder(null);
    resetForm();
    fetchPurchaseOrders();
  } catch (error) {
    console.error("Error saving purchase order:", error);
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: "Failed to save purchase order",
      life: 3000,
    });
  }
};


  const handleDeletePurchaseOrder = (purchaseOrderId) => {
    confirmDialog({
      message: "Are you sure you want to delete this purchase order?",
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await api.delete(`/purchase/order/${purchaseOrderId}`);
          toast.current.show({
            severity: "success",
            summary: "Deleted",
            detail: "Purchase order deleted successfully",
            life: 3000,
          });
          fetchPurchaseOrders();
        } catch (error) {
          console.error("Error deleting purchase order:", error);
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete purchase order",
            life: 3000,
          });
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
      product: "",
      supplier: "",
      quantityReceived: "",
      costPerUnit: "",
      receivedDate: "",
      notes: "",
      receivedBy: user?.id || "",
      status: "pending",
    });
  };

  // ---------------- TABLE UI ----------------
  const statusBodyTemplate = (rowData) => (
    <Tag value={rowData.status} severity={getSeverity(rowData.status)} />
  );

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        label="Edit"
        size="small"
        onClick={() => {
          setEditingOrder(rowData);
          setFormData({
            product: rowData.product?._id || rowData.product,
            supplier: rowData.supplier?._id || rowData.supplier,
            quantityReceived: rowData.quantityReceived,
            costPerUnit: rowData.costPerUnit,
            receivedDate: rowData.receivedDate?.split("T")[0],
            notes: rowData.notes,
            receivedBy: rowData.receivedBy?.id || rowData.receivedBy,
            status: rowData.status,
          });
          setVisible(true);
        }}
      />
      <Button
        label="Delete"
        size="small"
        severity="danger"
        onClick={() => handleDeletePurchaseOrder(rowData._id)}
      />
    </div>
  );

  const statusFilterTemplate = (options) => (
    <Dropdown
      value={options.value}
      options={statuses}
      onChange={(e) => options.filterCallback(e.value, options.index)}
      itemTemplate={(option) => (
        <Tag value={option} severity={getSeverity(option)} />
      )}
      placeholder="Select Status"
      className="p-column-filter"
      showClear
    />
  );

  const header = (
    <div className="w-full flex justify-between align-items-center">
      <div className="flex gap-2">
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="Clear"
          outlined
          onClick={clearFilter}
        />
        <Button
          type="button"
          icon="pi pi-plus"
          label="New Purchase Order"
          onClick={() => {
            setEditingOrder(null);
            resetForm();
            setVisible(true);
          }}
        />
      </div>
      <div>
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search Purchase Orders..."
          />
        </IconField>
      </div>
    </div>
  );

  // ---------------- JSX RETURN ----------------
  return (
    <div className="card shadow rounded-lg p-4">
      <Toast ref={toast} />
      <ConfirmDialog />
      <DataTable
        value={purchaseOrders}
        paginator
        rows={10}
        showGridlines
        loading={loading}
        dataKey="_id"
        filters={filters}
        globalFilterFields={[
          "product.name",
          "supplier.name",
          "status",
          "receivedBy.fullName",
        ]}
        header={header}
        emptyMessage="No Purchase Orders found."
        breakpoint="768px"
        className="text-sm sm:text-base"
      >
        <Column
          field="product.name"
          header="Product"
          sortable
          style={{ minWidth: "10rem" }}
        />
        <Column
          field="supplier.name"
          header="Supplier"
          sortable
          style={{ minWidth: "10rem" }}
        />
        <Column
          field="quantityReceived"
          header="Quantity"
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="costPerUnit"
          header="Cost/Unit"
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="receivedDate"
          header="Received Date"
          sortable
          style={{ minWidth: "10rem" }}
          body={(rowData) =>
            new Date(rowData.receivedDate).toLocaleDateString()
          }
        />
        <Column
          field="status"
          header="Status"
          body={statusBodyTemplate}
          filter
          filterElement={statusFilterTemplate}
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="receivedBy.fullName"
          header="Received By"
          sortable
          style={{ minWidth: "10rem" }}
        />
        <Column
          header="Action"
          body={actionBodyTemplate}
          style={{ minWidth: "10rem" }}
        />
      </DataTable>

      {/* ✅ Add/Edit Modal */}
      <Dialog
        header={editingOrder ? "Edit Purchase Order" : "New Purchase Order"}
        visible={visible}
        onHide={() => setVisible(false)}
        style={{ width: "40rem" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dropdown
            name="product"
            value={formData.product}
            options={products.map((p) => ({
              label: p.name,
              value: p._id,
            }))}
            onChange={(e) => setFormData({ ...formData, product: e.value })}
            placeholder="Select Product"
            filter
            showClear
            className="w-full"
          />
          <Dropdown
            name="supplier"
            value={formData.supplier}
            options={suppliers.map((s) => ({
              label: s.name,
              value: s._id,
            }))}
            onChange={(e) => setFormData({ ...formData, supplier: e.value })}
            placeholder="Select Supplier"
            filter
            showClear
            className="w-full"
          />
          <InputText
            name="quantityReceived"
            value={formData.quantityReceived}
            onChange={handleInputChange}
            placeholder="Quantity Received"
            className="w-full"
          />
          <InputText
            name="costPerUnit"
            value={formData.costPerUnit}
            onChange={handleInputChange}
            placeholder="Cost per Unit"
            className="w-full"
          />
          <InputText
            type="date"
            name="receivedDate"
            value={formData.receivedDate}
            onChange={handleInputChange}
            placeholder="Received Date"
            className="w-full"
          />
          <InputText
            name="receivedBy"
            value={user?.fullName || ""}
            disabled
            placeholder="Received By"
            className="w-full"
          />
          <Dropdown
            name="status"
            value={formData.status}
            options={statuses}
            onChange={(e) => setFormData({ ...formData, status: e.value })}
            placeholder="Select Status"
            className="w-full"
          />
        </div>

        <div className="mt-4">
          <InputText
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Notes"
            className="w-full"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-3 pt-4">
          <Button
            label="Cancel"
            outlined
            onClick={() => setVisible(false)}
            className="w-full"
          />
          <Button
            label="Save"
            onClick={handleSavePurchaseOrder}
            className="w-full"
          />
        </div>
      </Dialog>
    </div>
  );
};

export default PurchaseOrdersTable;
