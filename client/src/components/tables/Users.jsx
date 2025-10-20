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

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [statuses] = useState(["active", "inactive", "suspended"]);

  const [visible, setVisible] = useState(false); // modal visibility
  const [editingUser, setEditingUser] = useState(null); // edit state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
    status: "active",
  });

  const toast = useRef(null);

  // ✅ Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch users",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch all roles
  const fetchRoles = async () => {
    try {
      const res = await api.get("/role");
      setRoles(res.data.data || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchUsers();
    initFilters();
  }, []);

  // ---------------- FILTERS ----------------
  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      fullName: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      email: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
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

  // ---------------- UTILITIES ----------------
  const getSeverity = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      case "suspended":
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
  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, formData);
        toast.current.show({
          severity: "success",
          summary: "Updated",
          detail: "User updated successfully",
          life: 3000,
        });
      } else {
        await api.post("/register", formData);
        toast.current.show({
          severity: "success",
          summary: "Created",
          detail: "User added successfully",
          life: 3000,
        });
      }

      setVisible(false);
      setEditingUser(null);
      setFormData({
        fullName: "",
        email: "",
        password: "",
        role: "",
        status: "active",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save user",
        life: 3000,
      });
    }
  };

  const handleDeleteUser = (userId) => {
    confirmDialog({
      message: "Are you sure you want to delete this user?",
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await api.delete(`/users/${userId}`);
          toast.current.show({
            severity: "success",
            summary: "Deleted",
            detail: "User deleted successfully",
            life: 3000,
          });
          fetchUsers();
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete user",
            life: 3000,
          });
        }
      },
    });
  };

  // ---------------- TABLE UI ----------------
  const statusBodyTemplate = (rowData) => (
    <Button
      label={rowData.status}
      severity={getSeverity(rowData.status)}
      className="w-full capitalize"
      outlined
    />
  );

  const roleBodyTemplate = (rowData) => {
    const roleId = rowData.role?._id || rowData.role;
    const userRole = roles.find((r) => r._id === roleId);
    return userRole ? userRole.name : "—";
  };

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        label="Edit"
        size="small"
        onClick={() => {
          setEditingUser(rowData);
          setFormData({
            fullName: rowData.fullName,
            email: rowData.email,
            password: "",
            roleId: rowData.role?._id || rowData.role,
            status: rowData.status,
          });
          setVisible(true);
        }}
      />
      <Button
        label="Delete"
        size="small"
        severity="danger"
        onClick={() => handleDeleteUser(rowData._id)}
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
          label="New User"
          onClick={() => {
            setEditingUser(null);
            setFormData({
              fullName: "",
              email: "",
              password: "",
              role: "",
              status: "active",
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
            placeholder="Search users..."
          />
        </IconField>
      </div>
    </div>
  );

  // ---------------- JSX RETURN ----------------
  return (
    <div className="card shadow rounded-lg">
      <Toast ref={toast} />
      <ConfirmDialog />
      <DataTable
        value={users}
        paginator
        rows={10}
        showGridlines
        loading={loading}
        dataKey="_id"
        filters={filters}
        globalFilterFields={["fullName", "email", "status"]}
        header={header}
        emptyMessage="No users found."
        breakpoint="768px"
        className="text-sm sm:text-base"
      >
        <Column
          field="fullName"
          header="Full Name"
          filter
          sortable
          style={{ minWidth: "12rem" }}
        />
        <Column
          field="email"
          header="Email"
          filter
          sortable
          style={{ minWidth: "12rem" }}
        />
        <Column
          header="Role"
          body={roleBodyTemplate}
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
        header={editingUser ? "Edit User" : "New User"}
        visible={visible}
        onHide={() => setVisible(false)}
        style={{ width: "40rem" }}
      >
        <div>
          <InputText
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Full Name"
            className="w-full"
          />
        </div>

        <div className="mt-3 md:mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
          <div>
            <InputText
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full"
            />
          </div>
          {!editingUser && (
            <div>
              <InputText
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full"
              />
            </div>
          )}
          <div>
            <Dropdown
              name="role"
              value={formData.role}
              options={roles.map((r) => ({
                label: r.name,
                value: r._id,
              }))}
              onChange={(e) => setFormData({ ...formData, role: e.value })}
              placeholder="Select Role"
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
          <Button label="Save" onClick={handleSaveUser} className="w-full" />
        </div>
      </Dialog>
    </div>
  );
};

export default UsersTable;
