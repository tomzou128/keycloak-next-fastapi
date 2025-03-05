"use client";

import { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";

import { userApi } from "@/lib/api";

type ProfileFormValues = {
  company: string;
  position: string;
  phone: string;
  address: string;
};

/**
 * User Profile Page
 *
 * Shows and allows editing of the user's business profile data.
 * Demonstrates the synchronization between Keycloak and the application database.
 *
 * @returns The profile page component
 */
export default function ProfilePage() {
  const { data: session } = useSession();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [keycloakInfo, setKeycloakInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<ProfileFormValues>({
    defaultValues: {
      company: "",
      position: "",
      phone: "",
      address: "",
    },
  });

  // Fetch user information
  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get Keycloak user info
        const keycloakResponse = await userApi.getCurrentUser();
        if (keycloakResponse.data) {
          setKeycloakInfo(keycloakResponse.data);
        }

        // Get application profile info
        const profileResponse = await userApi.getUserProfile();
        if (profileResponse.data) {
          const profile = profileResponse.data;
          setUserInfo(profile);

          // Update form with profile data
          reset({
            company: profile.company || "",
            position: profile.position || "",
            phone: profile.phone || "",
            address: profile.address || "",
          });
        }
      } catch (err) {
        setError("Failed to load user profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUserInfo();
    }
  }, [session, reset]);

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Update profile
      const response = await userApi.updateUserProfile(data);

      if (response.data) {
        setUserInfo(response.data);
        setSuccess("Profile updated successfully");
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError("Failed to update profile");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Keycloak Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {keycloakInfo && (
                <Box>
                  <Typography variant="body1">
                    <strong>User ID:</strong> {keycloakInfo.sub}
                  </Typography>
                  {keycloakInfo.preferred_username && (
                    <Typography variant="body1">
                      <strong>Username:</strong> {keycloakInfo.preferred_username}
                    </Typography>
                  )}
                  {keycloakInfo.email && (
                    <Typography variant="body1">
                      <strong>Email:</strong> {keycloakInfo.email}
                    </Typography>
                  )}
                  {keycloakInfo.name && (
                    <Typography variant="body1">
                      <strong>Name:</strong> {keycloakInfo.name}
                    </Typography>
                  )}

                  <Typography variant="body2" color="text.secondary" mt={2}>
                    This information is managed by Keycloak and can only be changed in the Keycloak user management
                    system.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Business Profile
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Controller
                  name="company"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      margin="normal"
                      fullWidth
                      id="company"
                      label="Company"
                      disabled={saving}
                      {...field}
                    />
                  )}
                />

                <Controller
                  name="position"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      margin="normal"
                      fullWidth
                      id="position"
                      label="Position"
                      disabled={saving}
                      {...field}
                    />
                  )}
                />

                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      margin="normal"
                      fullWidth
                      id="phone"
                      label="Phone Number"
                      disabled={saving}
                      {...field}
                    />
                  )}
                />

                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      margin="normal"
                      fullWidth
                      id="address"
                      label="Address"
                      multiline
                      rows={3}
                      disabled={saving}
                      {...field}
                    />
                  )}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  sx={{ mt: 3 }}
                >
                  {saving ? <CircularProgress size={24} /> : "Save Profile"}
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                User Synchronization
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body2">
                This application demonstrates user synchronization between Keycloak and the application database:
              </Typography>

              <Typography variant="body2">
                <strong>1.</strong> When you log in, your basic profile is automatically synchronized from Keycloak.
              </Typography>
              <Typography variant="body2">
                <strong>2.</strong> Additional business information is stored in the application database.
              </Typography>
              <Typography variant="body2">
                <strong>3.</strong> If your Keycloak profile is updated, the changes will be synchronized to the
                application database on your next login.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
