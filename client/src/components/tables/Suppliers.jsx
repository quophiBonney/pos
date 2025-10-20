import React, { useState, useEffect } from "react";
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

const SuppliersTable = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [statuses] = useState(["active", "inactive", "terminated"]);

  const [visible, setVisible] = useState(false); // modal visibility
  const [editingSupplier, setEditingSupplier] = useState(null); // editing state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    contactPersonName: "",
    contactPersonPhone: "",
    status: "active",
  });
  const toast = React.useRef(null);

  // Fetch suppliers from backend API
  const fetchSuppliers = async () => {
    try {
      const response = await api.get("/supplier");
      const data = response.data.data || response.data;
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.current.show({
        severity: "error",
        summary: "Fetch Error",
        detail: "Failed to load suppliers",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      phone: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      email: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      address: {
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

  const clearFilter = () => {
    initFilters();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Create or Update Supplier
  const handleSaveSupplier = async () => {
    try {
      if (editingSupplier) {
        await api.put(`/supplier/${editingSupplier._id}`, formData);
        toast.current.show({
          severity: "success",
          summary: "Updated",
          detail: "Supplier updated successfully",
          life: 3000,
        });
      } else {
        await api.post("/supplier", formData);
        toast.current.show({
          severity: "success",
          summary: "Created",
          detail: "Supplier added successfully",
          life: 3000,
        });
      }

      setVisible(false);
      setEditingSupplier(null);
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        contactPersonName: "",
        contactPersonPhone: "",
        status: "active",
      });
      fetchSuppliers();
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save supplier",
        life: 3000,
      });
    }
  };

  // ✅ Delete Supplier Confirmation
  const handleDeleteSupplier = (supplierId) => {
    confirmDialog({
      message: "Are you sure you want to delete this supplier?",
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await api.delete(`/supplier/${supplierId}`);
          toast.current.show({
            severity: "success",
            summary: "Deleted",
            detail: "Supplier deleted successfully",
            life: 3000,
          });
          fetchSuppliers();
        } catch (error) {
          console.error("Error deleting supplier:", error);
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete supplier",
            life: 3000,
          });
        }
      },
    });
  };

  //import suppliers from CSV
  // 🔹 Create a ref for the hidden file input
  const fileInputRef = React.useRef(null);

  // 🔹 Open file selector when user clicks button
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  // 🔹 Handle file import (unchanged)
  const handleImportSuppliers = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/supplier/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.current.show({
        severity: "success",
        summary: "Imported",
        detail: "Suppliers imported successfully",
        life: 3000,
      });
      fetchSuppliers();
    } catch (error) {
      console.error("Error importing suppliers:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to import suppliers",
        life: 3000,
      });
    } finally {
      // Reset the file input so same file can be uploaded again if needed
      event.target.value = null;
    }
  };

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        label="Edit"
        size="small"
        onClick={() => {
          setEditingSupplier(rowData);
          setFormData({
            name: rowData.name,
            phone: rowData.phone,
            email: rowData.email,
            address: rowData.address,
            contactPersonName: rowData.contactPersonName,
            contactPersonPhone: rowData.contactPersonPhone,
            status: rowData.status,
          });
          setVisible(true);
        }}
      />
      <Button
        label="Delete"
        size="small"
        severity="danger"
        onClick={() => handleDeleteSupplier(rowData._id)}
      />
    </div>
  );

  const statusBodyTemplate = (rowData) => {
    const getStatusClass = (status) => {
      switch (status?.toLowerCase()) {
        case "active":
          return "bg-green-100 text-green-800";
        case "terminated":
          return "bg-red-100 text-red-800";
        case "inactive":
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
          label="New Supplier"
          onClick={() => {
            setEditingSupplier(null);
            setFormData({
              name: "",
              phone: "",
              email: "",
              address: "",
              contactPersonName: "",
              contactPersonPhone: "",
              status: "active",
            });
            setVisible(true);
          }}
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
            placeholder="Search suppliers..."
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
        value={suppliers}
        paginator
        rows={10}
        showGridlines
        loading={loading}
        dataKey="_id"
        filters={filters}
        globalFilterFields={["name", "phone", "email", "address", "status"]}
        header={header}
        emptyMessage="No suppliers found."
        breakpoint="768px"
        className="text-sm sm:text-base"
      >
        <Column
          field="name"
          header="Name"
          filter
          sortable
          style={{ minWidth: "12rem" }}
        />
        <Column
          field="phone"
          header="Phone"
          filter
          sortable
          style={{ minWidth: "10rem" }}
        />
        <Column
          field="email"
          header="Email"
          filter
          sortable
          style={{ minWidth: "12rem" }}
        />
        <Column
          field="address"
          header="Address"
          filter
          sortable
          style={{ minWidth: "10rem" }}
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
          header="Action"
          body={actionBodyTemplate}
          style={{ minWidth: "10rem" }}
        />
      </DataTable>

      {/* ✅ Add/Edit Modal */}
      <Dialog
        header={editingSupplier ? "Edit Supplier" : "New Supplier"}
        visible={visible}
        onHide={() => setVisible(false)}
        style={{ width: "40rem" }}
      >
        <div>
          <InputText
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Supplier Name"
            className="w-full"
          />
        </div>
        <div className="mt-3 md:mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
          <div>
            <InputText
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone Number"
              className="w-full"
            />
          </div>
          <div>
            <InputText
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address"
              className="w-full"
            />
          </div>
          <div>
            <InputText
              name="contactPersonName"
              value={formData.contactPersonName}
              onChange={handleInputChange}
              placeholder="Contact Person Name"
              className="w-full"
            />
          </div>
          <div>
            <InputText
              name="contactPersonPhone"
              value={formData.contactPersonPhone}
              onChange={handleInputChange}
              placeholder="Contact Person Phone"
              className="w-full"
            />
          </div>
          <div>
            <InputText
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Address"
              className="w-full"
            />
          </div>
          <div>
            <Dropdown
              name="status"
              value={formData.status}
              options={statuses}
              onChange={(e) => setFormData({ ...formData, status: e.value })}
              placeholder="Select Status"
              className="w-full"
            />
          </div>
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
            onClick={handleSaveSupplier}
            className="w-full"
          />
        </div>
      </Dialog>
    </div>
  );
};

export default SuppliersTable;
