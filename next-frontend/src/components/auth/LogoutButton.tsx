"use client";

import { Button } from "@mui/material";
import { federatedLogout } from "@/lib/auth";

/**
 * Logout Button component
 *
 * This component displays a button to log out from Keycloak.
 *
 * @returns The logout button component
 */
export default function LogoutButton() {
  /**
   * Handle logout button click
   *
   * This function initiates the Keycloak logout flow
   * using NextAuth.js.
   */

  return (
    <Button
      color="inherit"
      onClick={federatedLogout}
      sx={{ width: "100%", justifyContent: "flex-start" }}
    >
      Logout
    </Button>
  );
}
