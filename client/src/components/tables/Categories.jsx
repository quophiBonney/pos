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

const CategoriesTable = () => {
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [statuses] = useState(["active", "inactive", "terminated"]);

  const [visible, setVisible] = useState(false); // modal visibility
  const [editingCategory, setEditingCategory] = useState(null); // editing state
  const [formData, setFormData] = useState({
    name: "",
  });
  const toast = React.useRef(null);

  // Fetch Categories from backend API
  const fetchCategories = async () => {
    try {
      const response = await api.get("/category");
      const data = response.data;
      setCategories(data);
    } catch (error) {
      console.error("Error fetching Categories:", error);
      toast.current.show({
        severity: "error",
        summary: "Fetch Error",
        detail: "Failed to load Categories",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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

  // ✅ Create or Update Category
  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await api.put(`/category/${editingCategory._id}`, formData);
        toast.current.show({
          severity: "success",
          summary: "Updated",
          detail: "Category updated successfully",
          life: 3000,
        });
      } else {
        await api.post("/category", formData);
        toast.current.show({
          severity: "success",
          summary: "Created",
          detail: "Category added successfully",
          life: 3000,
        });
      }

      setVisible(false);
      setEditingCategory(null);
      setFormData({
        name: "",
      });
      fetchCategories();
    } catch (error) {
      console.error("Error saving Category:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save Category",
        life: 3000,
      });
    }
  };

  // ✅ Delete Category Confirmation
  const handleDeleteCategory = (categoryId) => {
    confirmDialog({
      message: "Are you sure you want to delete this Category?",
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await api.delete(`/category/${categoryId}`);
          toast.current.show({
            severity: "success",
            summary: "Deleted",
            detail: "Category deleted successfully",
            life: 3000,
          });
          fetchCategories();
        } catch (error) {
          console.error("Error deleting Category:", error);
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete Category",
            life: 3000,
          });
        }
      },
    });
  };

  //import Categories from CSV
  // 🔹 Create a ref for the hidden file input
  const fileInputRef = React.useRef(null);

  // 🔹 Open file selector when user clicks button
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        label="Edit"
        size="small"
        onClick={() => {
          setEditingCategory(rowData);
          setFormData({
            name: rowData.name,
          });
          setVisible(true);
        }}
      />
      <Button
        label="Delete"
        size="small"
        severity="danger"
        onClick={() => handleDeleteCategory(rowData._id)}
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
          label="New Category"
          onClick={() => {
            setEditingCategory(null);
            setFormData({
              name: "",
            });
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
            placeholder="Search Categories..."
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
        value={categories}
        paginator
        rows={10}
        showGridlines
        loading={loading}
        dataKey="_id"
        filters={filters}
        globalFilterFields={["name", "phone", "email", "address", "status"]}
        header={header}
        emptyMessage="No Categories found."
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
          header="Action"
          body={actionBodyTemplate}
          style={{ minWidth: "10rem" }}
        />
      </DataTable>

      {/* ✅ Add/Edit Modal */}
      <Dialog
        header={editingCategory ? "Edit Category" : "New Category"}
        visible={visible}
        onHide={() => setVisible(false)}
        style={{ width: "40rem" }}
      >
        <div>
          <InputText
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Category Name"
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
            onClick={handleSaveCategory}
            className="w-full"
          />
        </div>
      </Dialog>
    </div>
  );
};

export default CategoriesTable;
