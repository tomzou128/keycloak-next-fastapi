"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactNode } from "react";

/**
 * Create a Material UI theme
 */
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

/**
 * Props for the Providers component
 */
interface ProvidersProps {
  children: ReactNode;
}

/**
 * Application providers
 *
 * This component wraps the application with all necessary providers:
 * - SessionProvider for authentication
 * - ThemeProvider for Material UI
 *
 * @param props Component props
 * @returns The wrapped components
 */
export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider refetchInterval={270}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
