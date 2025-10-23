import React, { useState, useEffect, useRef } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import Barcode from "react-barcode";
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

const ProductsTable = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const toast = useRef(null);

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);

  const [statuses] = useState([
    "available",
    "out of stock",
    "pending",
    "discounted",
    "discontinued",
  ]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    sku: "",
    productImage: "",
    basePrice: null,
    stock: null,
    cost: null,
    status: "",
    supplier: null,
  });

  const [categories] = useState([
    "Beverages",
    "Bakery",
    "Canned Goods",
    "Dairy Products",
    "Dry Goods",
    "Frozen Foods",
    "Fruits & Vegetables",
    "Snacks",
    "Meat & Poultry",
    "Seafood",
    "Household Supplies",
    "Personal Care",
    "Health & Wellness",
    "Baby Products",
    "Pet Supplies",
    "Stationery",
    "Cleaning Supplies",
    "Condiments & Sauces",
    "Cereals & Breakfast",
    "Alcoholic Beverages",
  ]);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/product");
      const data = response.data.data || response.data;
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get("/supplier");
      const data = response.data.data || response.data;
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
    initFilters();
  }, []);

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

  const getSeverity = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "success";
      case "out of stock":
        return "danger";
      case "pending":
        return "warning";
      case "discontinued":
        return "info";
      default:
        return null;
    }
  };

  const handleViewProduct = (product) => {
    setViewProduct(product);
    setViewModalVisible(true);
  };

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2 items-center">
      <Button
        label="View"
        icon="pi pi-eye"
        size="small"
        outlined
        severity="help"
        onClick={() => handleViewProduct(rowData)}
      />
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

  const statusBodyTemplate = (rowData) => {
    const getStatusClass = (status) => {
      switch (status?.toLowerCase()) {
        case "available":
          return "bg-green-100 text-green-800";
        case "out of stock":
          return "bg-red-100 text-red-800";
        case "pending":
          return "bg-yellow-100 text-yellow-800";
        case "discounted":
          return "bg-blue-100 text-blue-800";
        case "discontinued":
          return "bg-gray-100 text-gray-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
          rowData.status
        )}`}
      >
        {rowData.status}
      </span>
    );
  };

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
    rowData.basePrice ? `GHS ${rowData.basePrice.toFixed(2)}` : "-";

  const showProductModal = () => setProductModalVisible(true);
  const hideProductModal = () => {
    setProductModalVisible(false);
    setEditMode(false);
    setSelectedProduct(null);
    setNewProduct({
      name: "",
      category: "",
      sku: "",
      productImage: "",
      basePrice: null,
      stock: null,
      cost: null,
      status: "",
      supplier: null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (value, field) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(newProduct).forEach(([key, val]) => {
        if (val !== null && val !== undefined) formData.append(key, val);
      });

      if (editMode && selectedProduct) {
        await api.put(`/product/${selectedProduct._id}`, formData);
      } else {
        await api.post("/product", formData);
      }

      hideProductModal();
      fetchProducts();
    } catch (error) {
      console.error(
        "Error saving product:",
        error.response?.data || error.message || error
      );
    }
  };

  const handleEditProduct = (product) => {
    setEditMode(true);
    setSelectedProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      sku: product.sku,
      productImage: product.productImage,
      price: product.basePrice,
      stock: product.stock,
      cost: product.cost,
      status: product.status,
      supplier: product.supplier?._id || null,
    });
    setProductModalVisible(true);
  };

  const confirmDelete = (id) => {
    confirmDialog({
      message: "Are you sure you want to delete this product?",
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => handleDeleteProduct(id),
    });
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.delete(`/product/${id}`);
      fetchProducts();

      toast.current.show({
        severity: "success",
        summary: "Deleted",
        detail: "Product deleted successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete product",
        life: 3000,
      });
    }
  };

  const fileInputRef = useRef(null);

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleImportSuppliers = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/product/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { added, skipped, errors } = response.data;

      if (added > 0) {
        toast.current.show({
          severity: "success",
          summary: "Imported",
          detail: `${added} products imported successfully${
            skipped > 0 ? `, ${skipped} skipped` : ""
          }`,
          life: 3000,
        });
      } else {
        toast.current.show({
          severity: "error",
          summary: "Import Failed",
          detail:
            errors?.length > 0
              ? errors.join("; ")
              : "No products were imported",
          life: 5000,
        });
      }
      fetchProducts();
    } catch (error) {
      console.error("Error importing products:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to import products",
        life: 3000,
      });
    } finally {
      event.target.value = null;
    }
  };

  const skuBodyTemplate = (rowData) => {
    const handlePrint = () => {
      const printWindow = window.open("", "_blank", "width=400,height=300");
      printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode</title>
          <style>
            body { text-align: center; font-family: Arial, sans-serif; margin-top: 30px; }
            h4 { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h4>SKU: ${rowData.sku}</h4>
          <svg id="barcode"></svg>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            JsBarcode("#barcode", "${rowData.sku}", {
              format: "CODE128",
              lineColor: "#000",
              width: 5,
              height: 60,
              displayValue: true,
              fontSize: 20,
              margin: 10
            });
            window.print();
            window.onafterprint = () => window.close();
          </script>
        </body>
      </html>
    `);
      printWindow.document.close();
    };

    return (
      <div className="flex flex-col items-center">
        <small
          className="text-blue-600 font-bold hover:underline cursor-pointer mt-1"
          onClick={handlePrint}
        >
          Print Barcode
        </small>
      </div>
    );
  };

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
        <Button
          type="button"
          icon="pi pi-plus"
          label="Add Product"
          outlined
          onClick={showProductModal}
        />
        <input
          type="file"
          accept=".csv, .xlsx"
          ref={fileInputRef}
          onChange={handleImportSuppliers}
          style={{ display: "none" }}
        />
        <Button
          type="button"
          icon="pi pi-upload"
          label="Import CSV"
          outlined
          severity="success"
          onClick={handleFileButtonClick}
        />
      </div>
      <div>
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search products..."
          />
        </IconField>
      </div>
    </div>
  );

  return (
    <div className="card shadow rounded-lg">
      <Toast ref={toast} />
      <ConfirmDialog />
      <DataTable
        value={products}
        paginator
        rows={10}
        showGridlines
        loading={loading}
        dataKey="_id"
        filters={filters}
        globalFilterFields={["name", "category", "status", "supplier.name"]}
        header={header}
        emptyMessage="No products found."
        breakpoint="768px"
        className="text-sm sm:text-base"
      >
        <Column field="name" header="Name" sortable filter />
        <Column field="category" header="Category" filter />
        <Column
          field="price"
          header="Price"
          style={{ width: "12%" }}
          body={priceBodyTemplate}
        />
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

      {/* ✅ View Product Modal */}
      <div className="px-5">
        <Dialog
          header="Product Details"
          visible={viewModalVisible}
          style={{ width: "50rem" }}
          modal
          onHide={() => setViewModalVisible(false)}
        >
          {viewProduct && (
            <div className="space-y-4">
              {/* Product Image */}
              {viewProduct.productImage ? (
                <img
                  src={
                    typeof viewProduct.productImage === "string"
                      ? viewProduct.productImage
                      : URL.createObjectURL(viewProduct.productImage)
                  }
                  alt={viewProduct.name}
                  className="w-40 h-40 object-cover rounded-lg shadow mb-3 mx-auto"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center bg-gray-100 rounded-lg text-gray-500 mx-auto">
                  No Image
                </div>
              )}

              {/* Product Details Table */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2 text-gray-700 text-center">
                  Product Information
                </h4>
                <table className="w-full border border-gray-200">
                  <tbody>
                    <tr>
                      <td className="p-2 border-b font-semibold w-1/2">
                        Product Name
                      </td>
                      <td className="p-2 border-b">{viewProduct.name}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-b font-semibold">Category</td>
                      <td className="p-2 border-b">{viewProduct.category}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-b font-semibold">SKU</td>
                      <td className="p-2 border-b">{viewProduct.sku}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-b font-semibold">Price</td>
                      <td className="p-2 border-b text-right">
                        GHS {viewProduct.basePrice?.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border-b font-semibold">Cost</td>
                      <td className="p-2 border-b text-right">
                        GHS {viewProduct.cost?.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border-b font-semibold">Stock</td>
                      <td className="p-2 border-b">{viewProduct.stock}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-b font-semibold">Status</td>
                      <td className="p-2 border-b">
                        <Tag
                          value={viewProduct.status}
                          severity={getSeverity(viewProduct.status)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border-b font-semibold">Supplier</td>
                      <td className="p-2 border-b">
                        {viewProduct.supplier?.name || "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border-b font-semibold">Created At</td>
                      <td className="p-2 border-b">
                        {viewProduct.createdAt
                          ? new Date(viewProduct.createdAt).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Sales Summary Table */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2 text-gray-700 text-center">
                  Sales Summary
                </h4>
                <table className="w-full border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-2 border-b">Description</th>
                      <th className="p-2 border-b text-right">Amount (GHS)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border-b">
                        Total Revenue (if sold out)
                      </td>
                      <td className="p-2 border-b text-right">
                        {(viewProduct.basePrice * viewProduct.stock).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border-b">Total Cost</td>
                      <td className="p-2 border-b text-right">
                        {(viewProduct.cost * viewProduct.stock).toFixed(2)}
                      </td>
                    </tr>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="p-2">Expected Profit</td>
                      <td className="p-2 text-right">
                        {(
                          viewProduct.basePrice * viewProduct.stock -
                          viewProduct.cost * viewProduct.stock
                        ).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default ProductsTable;
