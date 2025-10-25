import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  CircularProgress,
  Divider,
  Badge,
  Avatar,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Inventory2,
  ReceiptLong,
  Payment,
  ExpandLess,
  ExpandMore,
  Group,
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
import { createTheme, ThemeProvider } from "@mui/material/styles";
import api from "../../utils/api";

// Pages
import Products from "../../pages/Products";
import Suppliers from "../../pages/Suppliers";
import Users from "../../pages/Users";
import Reports from "../../pages/Reports";
import Roles from "../../pages/Roles";
import Cart from "../../pages/Cart";
import Orders from "../../pages/Orders";
import SalesOverview from "../chart/SalesOverview";
import CategoriesTable from "../tables/Categories";
import PurchaseOrder from "../../pages/PurchaseOrder";

const drawerWidth = 260;

// THEME
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#0288d1" },
    background: { default: "#f1f5f9", paper: "#ffffff" },
    text: { primary: "#1e293b", secondary: "#64748b" },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h6: { fontWeight: 600 },
    body1: { fontSize: 14 },
  },
});

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <DashboardIcon />,
    roles: ["super admin", "admin", "manager", "cashier", "accountant"],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: <Inventory2 />,
    roles: ["super admin", "admin", "manager", "cashier"],
    submenu: [
      { id: "products", label: "Products", roles: ["super admin", "admin", "manager", "cashier"] },
      { id: "suppliers", label: "Suppliers", roles: ["super admin", "admin", "manager"] },
      { id: "categories", label: "Categories", roles: ["super admin", "admin", "manager"] },
      { id: "purchase order", label: "Purchase Order", roles: ["super admin", "admin", "manager"] },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    icon: <BarChartIcon />,
    roles: ["super admin", "admin", "manager"],
    submenu: [
      { id: "sales", label: "Sales Overview", roles: ["super admin", "admin", "manager"] },
      { id: "cart", label: "Cart", roles: ["super admin", "cashier", "admin"] },
      { id: "orders", label: "Orders", roles: ["super admin", "admin", "manager", "cashier"] },
    ],
  },
  {
    id: "users",
    label: "Users",
    icon: <Group />,
    roles: ["super admin", "admin"],
  },
  {
    id: "reports",
    label: "Reports",
    icon: <ReceiptLong />,
    roles: ["super admin", "admin", "manager", "accountant"],
  },
  {
    id: "payments",
    label: "Payments",
    icon: <Payment />,
    roles: ["super admin", "accountant"],
  },
  {
    id: "roles",
    label: "Roles",
    icon: <PeopleIcon />,
    roles: ["super admin", "admin"],
  },
];

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [openMenus, setOpenMenus] = useState({});
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
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const role = storedUser?.role?.toLowerCase() || "cashier";

  const isSuperAdmin = role === "super admin";
  const accessibleNavItems = isSuperAdmin
    ? navItems
    : navItems.filter((item) => item.roles.includes(role));

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
    } catch {
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
    } catch {
      setError("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(val);

  const formatDate = (d) => new Date(d).toLocaleDateString();

  const handleMenuToggle = (id) =>
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/auth/login", { replace: true });
  };

  const drawer = (
    <Box sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
      <Box textAlign="center" mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
          CS POS
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {role.toUpperCase()} PANEL
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <List sx={{ flexGrow: 1 }}>
        {accessibleNavItems.map((item) => (
          <div key={item.id}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() =>
                  item.submenu ? handleMenuToggle(item.id) : setActiveNav(item.id)
                }
                selected={activeNav === item.id}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "& .MuiListItemIcon-root": { color: "white" },
                  },
                  "&:hover": { bgcolor: "rgba(25,118,210,0.1)" },
                }}
              >
                <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
                {item.submenu && (openMenus[item.id] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>
            {item.submenu && (
              <Collapse in={openMenus[item.id]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenu.map((sub) => (
                    <ListItem key={sub.id} disablePadding>
                      <ListItemButton
                        sx={{ pl: 4 }}
                        onClick={() => setActiveNav(sub.id)}
                        selected={activeNav === sub.id}
                      >
                        <ListItemText primary={sub.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </div>
        ))}
      </List>

      <Divider sx={{ mt: 2, mb: 1 }} />
      <Button variant="contained" fullWidth onClick={handleLogout}>
        Logout
      </Button>
    </Box>
  );

  const renderPage = () => {
    switch (activeNav) {
      case "products": return <Products />;
      case "suppliers": return <Suppliers />;
      case "categories": return <CategoriesTable />;
      case "sales": return <SalesOverview />;
      case "cart": return <Cart />;
      case "orders": return <Orders />;
      case "purchase order": return <PurchaseOrder/>;
      case "users": return <Users />;
      case "reports": return <Reports />;
      case "roles": return <Roles />;
      case "payments":
        return (
          <Box sx={{ textAlign: "center", mt: 5 }}>
            <Typography variant="h5">Payments Page</Typography>
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={3}>
              Sales Performance
            </Typography>
            <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight="bold">Sales Analytics</Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Period</InputLabel>
                    <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value)}>
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: "100%", height: 400, mt: 2 }}>
                  <ResponsiveContainer>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatDate} />
                      <YAxis tickFormatter={formatCurrency} />
                      <Tooltip />
                      <Line type="monotone" dataKey="sales" stroke="#1976d2" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography fontWeight="bold" mb={2}>
                  Orders Overview
                </Typography>
                <Box sx={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatDate} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#2e7d32" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error}
      </Alert>
    );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: "white",
            borderBottom: "1px solid #e2e8f0",
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            color: "text.primary",
          }}
        >
          <Toolbar>
            <IconButton edge="start" sx={{ mr: 2, display: { sm: "none" } }} onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}
            </Typography>
            <IconButton>
              <Badge badgeContent={3} color="primary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Avatar sx={{ ml: 2, bgcolor: "primary.main" }}>
              <AccountCircle />
            </Avatar>
          </Toolbar>
        </AppBar>

        <Box component="nav" sx={{ width: { sm: drawerWidth } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": { width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          {renderPage()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
