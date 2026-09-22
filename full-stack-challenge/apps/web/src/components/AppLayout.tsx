import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import SensorsIcon from "@mui/icons-material/Sensors";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { useAppDispatch } from "../app/hooks";

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  {
    to: "/machines",
    label: "Machines",
    icon: <PrecisionManufacturingIcon />,
    testId: "nav-machines",
  },
  {
    to: "/monitoring-points",
    label: "Monitoring points",
    icon: <SensorsIcon />,
    testId: "nav-monitoring-points",
  },
  {
    to: "/time-series",
    label: "Time series",
    icon: <ShowChartIcon />,
    testId: "nav-time-series",
  },
];

export function AppLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const email = 'email@user.com';

  const drawerContent = (
    <>
      <Toolbar />
      <List>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            selected={pathname.startsWith(item.to)}
            onClick={() => setMobileOpen(false)}
            data-testid={item.testId}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          {!isDesktop && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Dynamox
          </Typography>
          {email && (
            <Typography
              variant="body2"
              sx={{ mr: 2, display: { xs: "none", sm: "block" } }}
            >
              {email}
            </Typography>
          )}
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={() => dispatch(() => {/*logout()*/ })}
            data-testid="logout-button"
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop || mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, minWidth: 0 }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
