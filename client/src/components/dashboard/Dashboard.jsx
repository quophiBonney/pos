import React, { useState } from "react";
import {
  Box,
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
  Divider,
  Badge,
  Avatar,
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
  AssignmentTurnedIn,
  Group,
  ReceiptLong,
  Payment,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Import pages
import Products from "../../pages/Products";
import Suppliers from "../../pages/Suppliers";
import Users from "../../pages/Users";
import Reports from "../../pages/Reports";
import Roles from "../../pages/Roles";
import Cart from "../../pages/Cart";
import Orders from "../../pages/Orders";

const drawerWidth = 260;

// Theme setup
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    background: { default: "#f8fafc" },
    text: { primary: "#1e293b", secondary: "#64748b" },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h6: { fontWeight: 600 },
  },
});

// ✅ Navigation items with role-based access
const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <DashboardIcon />,
    roles: ["super admin", "admin", "manager", "cashier", "accountant"],
  },
  {
    id: "sales",
    label: "Sales",
    icon: <BarChartIcon />,
    roles: ["super admin", "admin", "manager"],
  },
  {
    id: "products",
    label: "Products",
    icon: <Inventory2 />,
    roles: ["super admin", "admin", "manager", "cashier"],
  },
  {
    id: "suppliers",
    label: "Suppliers",
    icon: <PeopleIcon />,
    roles: ["super admin", "admin", "manager"],
  },
  {
    id: "cart",
    label: "Cart",
    icon: <ShoppingCartIcon />,
    roles: ["super admin", "cashier", "admin"],
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
    id: "orders",
    label: "Orders",
    icon: <AssignmentTurnedIn />,
    roles: ["super admin", "admin", "manager", "cashier"],
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

  // ✅ Get role from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const role = storedUser?.role?.toLowerCase() || "cashier";

  // ✅ Define role checks
  const isSuperAdmin = role === "super admin";
  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isCashier = role === "cashier";
  const isAccountant = role === "accountant";

  // ✅ Filter menu items
  const accessibleNavItems = isSuperAdmin
    ? navItems // super admin sees all
    : navItems.filter((item) => item.roles.includes(role));

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // Sidebar content
  const drawer = (
    <Box
      sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography variant="h6" fontWeight={700}>
          CS POS
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isSuperAdmin
            ? "Super Admin Panel"
            : isAdmin
            ? "Admin Panel"
            : isManager
            ? "Manager Panel"
            : isAccountant
            ? "Accountant Panel"
            : "Cashier Panel"}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Sidebar menu items */}
      <List sx={{ flexGrow: 1 }}>
        {accessibleNavItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={activeNav === item.id}
              onClick={() => setActiveNav(item.id)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                transition: "0.2s",
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  "& .MuiListItemIcon-root": { color: "white" },
                },
                "&:hover": { bgcolor: "rgba(25,118,210,0.1)" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* ✅ Show "Add Product" button only for Admin, Manager, Super Admin */}
      {(isAdmin || isManager || isSuperAdmin) && (
        <>
          <Divider sx={{ mt: 2, mb: 1 }} />
          <Button variant="contained" fullWidth>
            + New Product
          </Button>
        </>
      )}
    </Box>
  );

  // ✅ Render correct page
  const renderPage = () => {
    switch (activeNav) {
      case "products":
        return <Products />;
      case "suppliers":
        return <Suppliers />;
      case "users":
        return <Users />;
      case "reports":
        return <Reports />;
      case "roles":
        return <Roles />;
      case "cart":
        return <Cart />;
      case "orders":
        return <Orders />;
      case "payments":
        return (
          <Box sx={{ textAlign: "center", mt: 5 }}>
            <Typography variant="h5">Payments Page</Typography>
          </Box>
        );
      default:
        return (
          <Box sx={{ textAlign: "center", mt: 5 }}>
            <Typography variant="h5">Welcome, {role.toUpperCase()}!</Typography>
            <Typography color="text.secondary">
              Select a section from the sidebar to get started.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CssBaseline />

        {/* Top AppBar */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: "white",
            borderBottom: "1px solid #e2e8f0",
            padding: "10px",
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            color: "text.primary",
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
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

        {/* Sidebar Drawer */}
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          {/* Mobile Drawer */}
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

          {/* Permanent Drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                borderRight: "1px solid #e2e8f0",
                bgcolor: "white",
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          {renderPage()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
