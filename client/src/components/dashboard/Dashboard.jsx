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
  Grid,
  Card,
  CardContent,
  TextField,
  Paper,
  InputAdornment,
  Badge,
  Avatar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Inventory2,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import Products from "../../pages/Products";
import Suppliers from "../../pages/Suppliers";
import Users from "../../pages/Users";
import Reports from "../../pages/Reports";
import Roles from "../../pages/Roles";
import Cart from "../../pages/Cart";
import Orders from "../../pages/Orders";
const drawerWidth = 260;

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
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
        },
      },
    },
  },
});

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { id: "sales", label: "Sales", icon: <BarChartIcon /> },
  { id: "products", label: "Products", icon: <Inventory2 /> },
  { id: "suppliers", label: "Suppliers", icon: <PeopleIcon /> },
  { id: "cart", label: "Cart", icon: <PeopleIcon /> },
  { id: "users", label: "Users", icon: <PeopleIcon /> },
  { id: "reports", label: "Reports", icon: <BarChartIcon /> },
  { id: "orders", label: "Orders", icon: <BarChartIcon /> },
  { id: "roles", label: "Roles", icon: <PeopleIcon /> },
];

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [query, setQuery] = useState("");

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box
      sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography variant="h6" fontWeight={700}>
          CS POS
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Admin Panel
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
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

      <Divider sx={{ mt: 2, mb: 1 }} />
      <Button variant="contained" fullWidth>
        + New Product
      </Button>
    </Box>
  );

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

          {activeNav === "dashboard" && <></>}

          {activeNav === "products" && <Products />}
          {activeNav === "suppliers" && <Suppliers />}
          {activeNav === "users" && <Users />}
          {activeNav === "reports" && <Reports />}
          {activeNav === "roles" && <Roles />}
          {activeNav === "cart" && <Cart />}
          {activeNav === "orders" && <Orders />}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
