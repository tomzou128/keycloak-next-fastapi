"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Avatar,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  List as ListIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  AccountCircle,
  Person as PersonIcon,
} from "@mui/icons-material";
import Link from "next/link";
import LoginButton from "../auth/LoginButton";
import LogoutButton from "../auth/LogoutButton";

/**
 * Header component
 *
 * This component displays the application header with navigation and authentication controls.
 *
 * @returns The header component
 */
export default function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  // Handle user menu open
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  // Handle user menu close
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Logo and brand */}
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            textDecoration: "none",
            color: "inherit",
            flexGrow: 1,
          }}
        >
          Keycloak Integration
        </Typography>

        {/* Desktop navigation */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          {session && (
            <>
              <Button
                color="inherit"
                component={Link}
                href="/dashboard"
                startIcon={<DashboardIcon />}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                component={Link}
                href="/items"
                startIcon={<ListIcon />}
              >
                Items
              </Button>
              <Button
                color="inherit"
                component={Link}
                href="/items/new"
                startIcon={<AddIcon />}
              >
                New Item
              </Button>
              <Button
                color="inherit"
                component={Link}
                href="/profile"
                startIcon={<PersonIcon />}
              >
                Profile
              </Button>
            </>
          )}
        </Box>

        {/* Authentication */}
        <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
          {session ? (
            <>
              <IconButton
                onClick={handleUserMenuOpen}
                color="inherit"
                edge="end"
                aria-label="account"
                aria-haspopup="true"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                onClick={handleUserMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem disabled>
                  <Typography variant="body2">
                    {session.user?.name || session.user?.email}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem component={Link} href="/dashboard">
                  <ListItemIcon>
                    <DashboardIcon fontSize="small" />
                  </ListItemIcon>
                  Dashboard
                </MenuItem>
                <MenuItem component={Link} href="/items">
                  <ListItemIcon>
                    <ListIcon fontSize="small" />
                  </ListItemIcon>
                  Items
                </MenuItem>
                <MenuItem component={Link} href="/items/new">
                  <ListItemIcon>
                    <AddIcon fontSize="small" />
                  </ListItemIcon>
                  New Item
                </MenuItem>
                <MenuItem component={Link} href="/profile">
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <Divider />
                <MenuItem>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <LogoutButton />
                </MenuItem>
              </Menu>
            </>
          ) : (
            <LoginButton />
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
