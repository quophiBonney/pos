import { useState, useEffect } from "react";
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
import { InputNumber } from "primereact/inputnumber";
import { FileUpload } from "primereact/fileupload";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import api from "../../utils/api";

const SalesTable = () => {
  const [orders, setOrders] = useState([]);
  [];
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const toast = useState(null);

  const [statuses] = useState(["completed", "pending", "cancelled"]);

  // =============================
  const fetchOrders = async () => {
    try {
      const response = await api.get("/order");
      const data = response.data.data || response.data;
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    initFilters();
  }, []);

  // =============================
  // Filters & Search
  // =============================
  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      name: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      price: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      category: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
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

  const clearFilter = () => initFilters();

  // =============================
  // Status & Button Templates
  // =============================
  const getSeverity = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      case "pending":
        return "warning";
      default:
        return null;
    }
  };

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2 items-center">
      <Button
        label="Edit"
        icon="pi pi-pencil"
        size="small"
        outlined
        severity="info"
        onClick={() => handleEditProduct(rowData)}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        size="small"
        severity="danger"
        onClick={() => confirmDelete(rowData._id)}
      />
    </div>
  );

  const statusBodyTemplate = (rowData) => (
    <div className="flex gap-2 items-center">
      <Button
        label={rowData.status}
        severity={getSeverity(rowData.status)}
        outlined
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

  const priceBodyTemplate = (rowData) =>
    rowData.price ? `$${rowData.price.toFixed(2)}` : "-";

  // =============================
  // Table Header
  // =============================
  const header = (
    <div className="flex justify-between align-items-center">
      <div className="flex gap-2">
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="Clear"
          outlined
          onClick={clearFilter}
        />
      </div>
      <div>
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search orders..."
          />
        </IconField>
      </div>
    </div>
  );

  return (
    <div className="card shadow rounded-lg">
      <Toast ref={toast} />
      <DataTable
        value={orders}
        paginator
        rows={10}
        showGridlines
        loading={loading}
        dataKey="_id"
        filters={filters}
        globalFilterFields={["completed", "cancelled", "pending"]}
        header={header}
        emptyMessage="No orders found."
        breakpoint="768px"
        className="text-sm sm:text-base"
      >
        <Column field="name" header="Name" sortable filter />
        <Column field="category" header="Category" filter />
        <Column field="price" header="Price" body={priceBodyTemplate} />
        <Column field="stock" header="Quantity" sortable />
        <Column field="cost" header="Cost" sortable />
        <Column
          field="supplier._id"
          header="Supplier"
          body={(rowData) => rowData.supplier?.name || "-"}
          filter
        />
        <Column
          field="sku"
          header="Barcode"
          body={skuBodyTemplate}
          style={{ width: "2rem" }}
        />
        <Column
          field="status"
          header="Status"
          body={statusBodyTemplate}
          filter
          filterElement={statusFilterTemplate}
        />
        <Column field="action" header="Action" body={actionBodyTemplate} />
      </DataTable>

      {/* ✅ Add/Edit Modal */}
      <Dialog
        header={editMode ? "Edit Product" : "Add New Product"}
        visible={productModalVisible}
        style={{ width: "50rem" }}
        modal
        className="p-fluid"
        onHide={hideProductModal}
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-2">Product Name</label>
              <InputText
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2">SKU</label>
              <InputText
                name="sku"
                value={newProduct.sku}
                onChange={handleInputChange}
                placeholder="Enter SKU"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Category</label>
              <Dropdown
                value={newProduct.category}
                options={categories}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, category: e.value }))
                }
                placeholder="Select category"
                showClear
                filter
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Price (GHS)</label>
              <InputNumber
                value={newProduct.price}
                onValueChange={(e) => handleNumberChange(e.value, "price")}
                mode="currency"
                currency="GHS"
                locale="en-GH"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Cost (GHS)</label>
              <InputNumber
                value={newProduct.cost}
                onValueChange={(e) => handleNumberChange(e.value, "cost")}
                mode="currency"
                currency="GHS"
                locale="en-GH"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Quantity</label>
              <InputNumber
                value={newProduct.stock}
                onValueChange={(e) => handleNumberChange(e.value, "stock")}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Supplier</label>
              <Dropdown
                value={newProduct.supplier}
                options={suppliers}
                optionLabel="name"
                optionValue="_id"
                placeholder="Select supplier"
                showClear
                filter
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, supplier: e.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Status</label>
              <Dropdown
                value={newProduct.status}
                options={statuses}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, status: e.value }))
                }
                placeholder="Select status"
                required
              />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-2">Product Image</label>
            <FileUpload
              name="productImage"
              accept="image/*"
              mode="advanced"
              customUpload
              auto={false}
              chooseLabel="Browse"
              uploadLabel="Upload"
              cancelLabel="Clear"
              maxFileSize={5 * 1024 * 1024}
              emptyTemplate={<p>Drag and drop an image or click Browse</p>}
              onSelect={(e) => {
                const file = e.originalEvent?.target?.files?.[0] || e.files[0];
                setNewProduct((prev) => ({ ...prev, productImage: file }));
              }}
              onClear={() =>
                setNewProduct((prev) => ({ ...prev, productImage: null }))
              }
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              label="Cancel"
              icon="pi pi-times"
              outlined
              onClick={hideProductModal}
              type="button"
            />
            <Button
              label={editMode ? "Update" : "Save"}
              icon="pi pi-check"
              type="submit"
              severity="success"
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default SalesTable;
