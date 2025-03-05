"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";

import ItemList from "@/components/items/ItemList";
import { userApi } from "@/lib/api";

/**
 * Items Page
 *
 * Shows a list of items, with a tab for all items if the user has admin role.
 *
 * @returns The items page component
 */
export default function ItemsPage() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Check if the user has admin role
  useEffect(() => {
    const checkAdminRole = async () => {
      if (status === "authenticated") {
        setLoading(true);
        try {
          const response = await userApi.getCurrentUser();
          if (response.data) {
            // Check if user has admin role
            const userRoles = response.data.realmAccess?.roles || [];
            setIsAdmin(userRoles.includes("admin"));
          }
        } catch (err) {
          console.error("Failed to check admin role:", err);
          setError("Failed to load user role information");
        } finally {
          setLoading(false);
        }
      }
    };

    checkAdminRole();
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Items Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isAdmin && (
        <Paper sx={{ mb: 4 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Your Items" />
            <Tab label="All Items (Admin)" />
          </Tabs>
        </Paper>
      )}

      {isAdmin && tabValue === 1 ? (
        <ItemList isAdmin />
      ) : (
        <ItemList />
      )}
    </Box>
  );
}
