import React, { useState, useEffect } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import api from "../../utils/api";

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  // ✅ Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await api.get("/order");
      setOrders(res.data);
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

  // ✅ Initialize filters
  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      paymentMethod: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      status: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
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

  // ✅ Header section
  const header = (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <Button
        type="button"
        icon="pi pi-filter-slash"
        label="Clear"
        outlined
        onClick={clearFilter}
      />
      <IconField iconPosition="left" className="w-full sm:w-64">
        <InputIcon className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Search orders..."
          className="w-full"
        />
      </IconField>
    </div>
  );

  // ✅ Format templates
  const itemsBodyTemplate = (rowData) => {
     console.log(rowData);
    rowData.items
      .map((item) => `${item.name || "Unknown"} (x${item.quantity})`)
      .join(", ");
  }
  const userBodyTemplate = (rowData) =>
    rowData.user?.email || <span className="text-gray-400 italic">Guest</span>;

  const currencyBodyTemplate = (value) =>
    `₵${Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const dateBodyTemplate = (rowData) =>
    new Date(rowData.createdAt).toLocaleString();

  const statusBodyTemplate = (rowData) => {
    const statusClass =
      rowData.status === "completed" || rowData.status === "paid"
        ? "bg-green-100 text-green-800"
        : "bg-yellow-100 text-yellow-800";

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}
      >
        {rowData.status}
      </span>
    );
  };

  // ✅ Responsive table setup
  return (
    <div className="card shadow rounded-lg overflow-hidden">
      <DataTable
        value={orders}
        paginator
        rows={10}
        showGridlines
        loading={loading}
        dataKey="_id"
        filters={filters}
        globalFilterFields={[
          "paymentMethod",
          "status",
          "user.email",
          "items.product.name",
        ]}
        header={header}
        emptyMessage="No orders found."
        breakpoint="768px" // When to switch to stacked layout
        className="text-sm sm:text-base"
      >
        <Column
          header="Prepared By"
          body={userBodyTemplate}
          style={{ minWidth: "10rem", wordBreak: "break-word" }}
        />
        <Column
          field="paymentMethod"
          header="Payment Type"
          sortable
          style={{
            minWidth: "12rem",
            wordBreak: "break-word",
            textAlign: "center",
          }}
        />
        <Column
          header="Items"
          body={itemsBodyTemplate}
          style={{ minWidth: "18rem", wordBreak: "break-word" }}
        />
        <Column
          field="total"
          header="Total"
          body={(rowData) => currencyBodyTemplate(rowData.total)}
          sortable
          style={{ minWidth: "8rem", textAlign: "right" }}
        />
        <Column
          field="status"
          header="Status"
          body={statusBodyTemplate}
          sortable
          style={{ minWidth: "8rem", textAlign: "center" }}
        />
        <Column
          field="createdAt"
          header="Date"
          body={dateBodyTemplate}
          sortable
          style={{ minWidth: "5rem", whiteSpace: "wrap" }}
        />
      </DataTable>
    </div>
  );
};

export default OrdersTable;
