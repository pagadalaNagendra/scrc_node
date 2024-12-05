import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, CssBaseline, Typography, Badge, Dialog, DialogContent } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import BatchPredictionIcon from "@mui/icons-material/BatchPrediction";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings"; // Import new icon
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import Notification from "../Notification/notification";
import { useAuth } from "../usermanagement/AuthContext";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import config from "../config";
const drawerWidth = 180;
const primaryColor = "#123462";

export default function SidebarNavbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(Date.now());

  const navigate = useNavigate(); // Initialize the navigate hook
  const { isAuthenticated, logout } = useAuth();
  
  // Retrieve user role from localStorage
  const userRole = localStorage.getItem('usertype');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleNavigate = (path) => {
    navigate(path); // Use navigate to go to the given path
  };

  const handleNotificationsClick = () => {
    if (isAuthenticated) {
      setIsNotificationDialogOpen(true);
    }
  };

  const handleCloseNotificationDialog = () => {
    setIsNotificationDialogOpen(false);
  };

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch(`${config.backendAPI}/alerts/`,)
      .then((response) => response.json())
      .then((data) => {
        setAlerts(data);
      })
      .catch((err) => {
        console.error("Failed to fetch data", err);
      });
  }, []);

  const handleSettingsClick = () => {
    navigate("/Node-Simultor/createuser");
  };

  // Handle account icon click (log out)
  const handleAccountClick = () => {
    // Clear session storage and logout
    localStorage.clear();
    // Redirect to login page
    navigate("Node-Simultor/Login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: primaryColor,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton color="inherit" edge="start" onClick={toggleSidebar} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <img src="https://res.cloudinary.com/dxoq1rrh4/image/upload/v1721754287/left_xfp4qb.png" alt="Logo 1" style={{ height: 60, marginRight: 10 }} />
              <img src="https://res.cloudinary.com/dxoq1rrh4/image/upload/v1730886247/SMART_CITY_LOGO.8f8e3abe7957eafb9ff6_hcnlrr.png" alt="Logo 2" style={{ height: 60 }} />
            </Box>
          </Box>

          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center", marginLeft: "-220px" }}>
            Node Simulator
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton color="inherit" onClick={handleNotificationsClick} disabled={!isAuthenticated}>
              <Badge badgeContent={alerts.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Conditionally render Settings icon for admin only */}
            {userRole === 'admin' && (
              <IconButton color="inherit" onClick={handleSettingsClick}>
                <AddCircleOutlineIcon />
              </IconButton>
            )}

            {/* Profile Icon (which logs out on click) */}
            <IconButton color="inherit" onClick={handleAccountClick} disabled={!isAuthenticated}>
              <AccountCircleIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Left Sidebar Drawer */}
      <Drawer
        variant="permanent"
        open={isSidebarOpen}
        sx={{
          width: isSidebarOpen ? drawerWidth : 60,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isSidebarOpen ? drawerWidth : 60,
            boxSizing: "border-box",
            backgroundColor: "#FFFFFF",
            transition: "width 0.3s",
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItem button onClick={() => handleNavigate("/Node-Simultor")}>
            <ListItemIcon>
              <HomeIcon sx={{ color: "#707070" }} />
            </ListItemIcon>
            {isSidebarOpen && <ListItemText primary="Home" sx={{ color: "#707070" }} />}
          </ListItem>

          <ListItem button onClick={() => handleNavigate("/Node-Simultor/Addvertical")}>
            <ListItemIcon>
              <AutoAwesomeMotionIcon sx={{ color: "#707070" }} />
            </ListItemIcon>
            {isSidebarOpen && <ListItemText primary="Add vertical" sx={{ color: "#707070" }} />}
          </ListItem>

          <ListItem button onClick={() => handleNavigate("/Node-Simultor/Predefinedconfigurations")}>
            <ListItemIcon>
              <BatchPredictionIcon sx={{ color: "#707070" }} />
            </ListItemIcon>
            {isSidebarOpen && <ListItemText primary="Predefined" sx={{ color: "#707070" }} />}
          </ListItem>

          <ListItem button onClick={() => handleNavigate("/Node-Simultor/Historystatus")}>
            <ListItemIcon>
              <HistoryEduIcon sx={{ color: "#707070" }} />
            </ListItemIcon>
            {isSidebarOpen && <ListItemText primary="Historystatus" sx={{ color: "#707070" }} />}
          </ListItem>
        </List>
      </Drawer>

      {/* Notification Dialog */}
      <Dialog
        open={isNotificationDialogOpen}
        onClose={handleCloseNotificationDialog}
        maxWidth="sm"
        fullWidth={false}
        sx={{
          "& .MuiDialog-paper": {
            marginRight: "-700px",
            background: "none",
            marginTop: "-80px",
          },
          "& .MuiDialogContent-root": {
            overflow: "hidden",
          },
        }}
      >
        <DialogContent>
          <Notification reloadKey={reloadKey} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
