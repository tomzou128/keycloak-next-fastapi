"use client";

import { useSession } from "next-auth/react";
import { Typography, Box, Paper, Button, Stack } from "@mui/material";
import { Dashboard as DashboardIcon } from "@mui/icons-material";
import Link from "next/link";
import LoginButton from "@/components/auth/LoginButton";

/**
 * Home Page component
 *
 * This is the landing page of the application.
 * It displays different content based on the user's authentication status.
 *
 * @returns The home page component
 */
export default function HomePage() {
  // Get the current session
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Keycloak Integration Demo
        </Typography>

        <Typography variant="body1">
          This application demonstrates deep integration between Keycloak, Next.js, and FastAPI.
          Keycloak serves as the sole identity provider and JWT issuer for the application.
        </Typography>

        {isLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading authentication status...
          </Typography>
        ) : session ? (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Welcome back, {session.user?.name || "User"}!
            </Typography>

            <Typography variant="body1">
              You are successfully authenticated with Keycloak.
              Your access token is being used to communicate with the FastAPI backend.
            </Typography>

            <Button
              variant="contained"
              component={Link}
              href="/dashboard"
              startIcon={<DashboardIcon />}
              sx={{ mt: 2 }}
            >
              Go to Dashboard
            </Button>
          </Box>
        ) : (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Authentication Demo
            </Typography>

            <Typography variant="body1">
              Click the login button to authenticate with Keycloak.
              This will redirect you to the Keycloak login page.
            </Typography>

            <LoginButton />
          </Box>
        )}
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          About This Demo
        </Typography>

        <Typography variant="body1">
          This application demonstrates:
        </Typography>

        <Stack component="ul" spacing={1} sx={{ pl: 4 }}>
          <Typography component="li" variant="body1">
            Authentication with Keycloak using OpenID Connect
          </Typography>
          <Typography component="li" variant="body1">
            Token management and refresh
          </Typography>
          <Typography component="li" variant="body1">
            Protected routes with NextAuth.js middleware
          </Typography>
          <Typography component="li" variant="body1">
            Backend API authentication and authorization
          </Typography>
          <Typography component="li" variant="body1">
            Role-based access control
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
