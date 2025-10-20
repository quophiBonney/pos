import React, { useState, useEffect } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "@mui/material";
import api from "../../utils/api";

const RolesTable = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [addPermission, setAddPermission] = useState(false);

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const res = await api.get("/role");
      setRoles(res.data.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch permissions (all)
  const fetchPermissions = async () => {
    try {
      const res = await api.get("/permission");
      setPermissions(res.data.data || []);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchRoles();
    initFilters();
  }, []);

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      name: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      description: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
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

  // View assigned permissions
  const handleViewPermissions = async (role) => {
    setSelectedRole(role);
    setVisible(true);
    setPermissionsLoading(true);
    try {
      const res = await api.get(`/role/${role._id}`);
      setRolePermissions(res.data.permissions || []);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      setRolePermissions([]);
    } finally {
      setPermissionsLoading(false);
    }
  };

  // Open add permission modal
  const handleAddPermissions = (role) => {
    setSelectedRole(role);
    setAddPermission(true);
  };

  const header = (
    <div className="flex justify-between items-center">
      <Button
        type="button"
        icon="pi pi-filter-slash"
        label="Clear"
        outlined
        onClick={clearFilter}
      />
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Search roles..."
        />
      </IconField>
    </div>
  );

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        label="Add"
        icon="pi pi-plus"
        className="p-button-success"
        onClick={() => handleAddPermissions(rowData)}
      />
      <Button
        label="Permissions"
        icon="pi pi-eye"
        className="p-button-info"
        onClick={() => handleViewPermissions(rowData)}
      />
    </div>
  );

  const checkboxBodyTemplate = (rowData) => <Checkbox checked />;

  return (
    <div className="card shadow rounded-lg">
      <DataTable
        value={roles}
        paginator
        rows={10}
        showGridlines
        loading={loading}
        dataKey="_id"
        filters={filters}
        globalFilterFields={["name", "description"]}
        header={header}
        emptyMessage="No roles found."
        breakpoint="768px"
        className="text-sm sm:text-base"
      >
        <Column
          field="name"
          header="Role Name"
          filter
          filterPlaceholder="Search by name"
          sortable
          style={{ minWidth: "12rem" }}
        />
        <Column
          field="description"
          header="Description"
          filter
          filterPlaceholder="Search by description"
          sortable
          style={{ minWidth: "16rem" }}
        />
        <Column
          header="Actions"
          body={actionBodyTemplate}
          style={{ minWidth: "12rem" }}
        />
      </DataTable>

      {/* View Permissions Modal */}
      <Dialog
        header={
          selectedRole ? `Permissions for ${selectedRole.name}` : "Permissions"
        }
        visible={visible}
        style={{ width: "50rem" }}
        modal
        onHide={() => setVisible(false)}
      >
        {permissionsLoading ? (
          <div className="flex justify-center items-center py-10">
            <i className="pi pi-spin pi-spinner text-3xl text-gray-600"></i>
            <span className="ml-3 text-gray-600">Loading permissions...</span>
          </div>
        ) : selectedRole ? (
          rolePermissions.length > 0 ? (
            <DataTable value={rolePermissions}>
              <Column field="name" header="Permission Name" />
              <Column field="description" header="Description" />
              <Column
                field="available"
                header="Access"
                body={checkboxBodyTemplate}
              />
            </DataTable>
          ) : (
            <p className="text-gray-500 italic">
              No permissions assigned to this role.
            </p>
          )
        ) : (
          <p>No role selected.</p>
        )}
      </Dialog>

      {/* Add Permission Modal */}
      <Dialog
        header="Add Role Permission"
        visible={addPermission}
        style={{ width: "40rem" }}
        modal
        onHide={() => setAddPermission(false)}
      >
        {selectedRole ? (
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              {selectedRole.name} — {selectedRole.description}
            </h3>
            <DataTable value={permissions}>
              <Column field="name" header="Permission Name" />
            </DataTable>
          </div>
        ) : (
          <p>No role selected.</p>
        )}
      </Dialog>
    </div>
  );
};

export default RolesTable;
