import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import api from "../../utils/api";

const SalesOverview = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [salesData, setSalesData] = useState([]);
  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchSalesData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/order");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setError("Failed to load dashboard statistics");
    }
  };

  const fetchSalesData = async () => {
    try {
      const response = await api.get(`/order/sales-data?period=${period}`);
      const data = response.data.data.map((item) => ({
        date: item._id,
        sales: item.totalSales,
        orders: item.orderCount,
      }));
      setSalesData(data);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setError("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(value);
  };

  const formatDate = (dateStr) => {
    if (period === "daily") {
      return new Date(dateStr).toLocaleDateString();
    } else if (period === "weekly") {
      const [year, week] = dateStr.split("-");
      return `Week ${week}, ${year}`;
    } else if (period === "monthly") {
      const [year, month] = dateStr.split("-");
      return new Date(year, month - 1).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
    }
    return dateStr;
  };

  const statsCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: <InventoryIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      color: "#1976d2",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <PeopleIcon sx={{ fontSize: 40, color: "success.main" }} />,
      color: "#2e7d32",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <ShoppingCartIcon sx={{ fontSize: 40, color: "warning.main" }} />,
      color: "#ed6c02",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: <MoneyIcon sx={{ fontSize: 40, color: "error.main" }} />,
      color: "#d32f2f",
    },
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Sales Overview
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: "100%",
                background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}05 100%)`,
                border: `1px solid ${card.color}20`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {card.value}
                    </Typography>
                  </Box>
                  {card.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Sales Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6" fontWeight="bold">
              Sales Analytics
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                label="Period"
                onChange={(e) => setPeriod(e.target.value)}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ width: "100%", height: 400 }}>
            <ResponsiveContainer>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis
                  tickFormatter={(value) => formatCurrency(value)}
                  fontSize={12}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === "sales" ? formatCurrency(value) : value,
                    name === "sales" ? "Revenue" : "Orders",
                  ]}
                  labelFormatter={(label) => `Date: ${formatDate(label)}`}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#1976d2"
                  strokeWidth={3}
                  dot={{ fill: "#1976d2", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Orders Chart */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            Orders Analytics
          </Typography>

          <Box sx={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  formatter={(value, name) => [value, "Orders"]}
                  labelFormatter={(label) => `Date: ${formatDate(label)}`}
                />
                <Bar dataKey="orders" fill="#2e7d32" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SalesOverview;
