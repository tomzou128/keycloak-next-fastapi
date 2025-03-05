"use client";

import { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { ArrowBack as BackIcon } from "@mui/icons-material";

import { userApi } from "@/lib/api";
import { User } from "@/lib/types";

/**
 * Admin Users Page
 *
 * Displays a list of all users in the system.
 * Only accessible to users with the admin role.
 *
 * @returns The admin users page component
 */
export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if the user has admin role and fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // First, check if the user has admin role
        const userResponse = await userApi.getCurrentUser();
        if (userResponse.data) {
          const userRoles = userResponse.data.realmAccess?.roles || [];
          if (!userRoles.includes("admin")) {
            setError("You do not have permission to access this page.");
            setLoading(false);
            return;
          }
        }

        // Fetch all users
        const response = await userApi.getAllUsers();
        if (response.data) {
          setUsers(response.data);
        } else if (response.error) {
          setError(response.error);
        }
      } catch (err) {
        setError("Failed to fetch users. You may not have admin permissions.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Box sx={{ mt: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => router.push("/dashboard")}
          sx={{ mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1">
          User Management (Admin)
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Paper elevation={1} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            No users found.
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Username</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Company</strong></TableCell>
                  <TableCell><strong>Profile Info</strong></TableCell>
                  <TableCell><strong>Created At</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Typography noWrap variant="body2" sx={{ maxWidth: 100 }}>
                        {user.id.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email || "N/A"}</TableCell>
                    <TableCell>{user.company || "N/A"}</TableCell>
                    <TableCell>
                      {user.phone && <Chip size="small" label={`Phone: ${user.phone}`} sx={{ mr: 1, mb: 1 }} />}
                      {user.position &&
                          <Chip size="small" label={`Position: ${user.position}`} sx={{ mr: 1, mb: 1 }} />}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt!).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Box mt={4}>
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6">
            About this Page
          </Typography>
          <Typography variant="body2">
            This page demonstrates role-based access control (RBAC) integration with Keycloak. Only users with
            the <strong>admin</strong> role can access this page.
          </Typography>
          <Typography variant="body2">
            The admin role is managed in Keycloak and synchronized to the application via the access token.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
