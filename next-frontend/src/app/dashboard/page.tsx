"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { userApi } from "@/lib/api";
import Link from "next/link";
import { List as ListIcon } from "@mui/icons-material";
import { UserInfo } from "@/lib/types";

/**
 * Dashboard Page component
 *
 * This is a protected page that displays user information and dashboard widgets.
 *
 * @returns The dashboard page component
 */
export default function DashboardPage() {
  // Get the current session
  const { data: session } = useSession();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user information from the backend
  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        const response = await userApi.getCurrentUser();
        if (response.data) {
          setUserInfo(response.data);
        } else if (response.error) {
          setError(response.error);
        }
      } catch (err) {
        setError("Failed to fetch user information");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Extract realm roles from user info
  const realmRoles = userInfo?.realmAccess?.roles || [];

  // Check if user has admin role
  const isAdmin = realmRoles.includes("admin");

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* User Info Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                User Information
              </Typography>
              {userInfo && (
                <Box>
                  <Typography variant="body1">
                    <strong>User ID:</strong> {userInfo.sub}
                  </Typography>
                  {userInfo.preferredUsername && (
                    <Typography variant="body1">
                      <strong>Username:</strong> {userInfo.preferredUsername}
                    </Typography>
                  )}
                  {userInfo.email && (
                    <Typography variant="body1">
                      <strong>Email:</strong> {userInfo.email}
                    </Typography>
                  )}
                  {userInfo.name && (
                    <Typography variant="body1">
                      <strong>Name:</strong> {userInfo.name}
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Roles Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Roles & Permissions
              </Typography>
              {realmRoles.length > 0 ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Realm Roles:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {realmRoles.map((role: string) => (
                      <Chip
                        key={role}
                        label={role}
                        color={role === "admin" ? "primary" : "default"}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No roles assigned
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Items Card */}
          <Grid size={{ xs: 12, md: isAdmin ? 5 : 12 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Your Items
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  component={Link}
                  href="/items"
                  startIcon={<ListIcon />}
                >
                  View All Items
                </Button>
              </Box>
              <Typography variant="body1">
                Manage your items in the Items section.
              </Typography>
            </Paper>
          </Grid>

          {/* Admin Section */}
          {isAdmin && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: "primary.light", color: "white" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" color="white">
                    Admin Controls
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    component={Link}
                    href="/admin/users"
                    color="secondary"
                  >
                    Manage Users
                  </Button>
                </Box>
                <Typography variant="body1" color="white">
                  You have administrator privileges. You can manage users and access all items in the system.
                </Typography>
                <Box mt={2} display="flex" gap={1}>
                  <Chip
                    label="Admin Role"
                    color="secondary"
                    size="small"
                  />
                  <Chip
                    label="View All Items"
                    component={Link}
                    href="/items?tab=1"
                    clickable
                    variant="outlined"
                    size="small"
                    sx={{ color: "white", borderColor: "white" }}
                  />
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Session Info Card */}
          <Grid size={{ xs: 12 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Session Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your session is managed by Keycloak. Here is some information about your current session:
              </Typography>
              <Typography variant="body2">
                <strong>Token expiry:</strong> {session?.expires}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={2}>
                When your session is about to expire, the application will automatically refresh your token.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
