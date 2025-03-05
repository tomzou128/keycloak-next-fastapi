"use client";

import { Button } from "@mui/material";
import { signIn } from "next-auth/react";
import { Login as LoginIcon } from "@mui/icons-material";

/**
 * Login Button component
 *
 * This component displays a button to initiate the Keycloak login flow.
 *
 * @returns The login button component
 */
export default function LoginButton() {
  /**
   * Handle login button click
   *
   * This function initiates the Keycloak authentication flow
   * using NextAuth.js.
   */
  const handleLogin = async () => {
    await signIn("keycloak", { callbackUrl: "/dashboard" });
  };

  return (
    <Button
      color="inherit"
      onClick={handleLogin}
      startIcon={<LoginIcon />}
    >
      Login
    </Button>
  );
}
