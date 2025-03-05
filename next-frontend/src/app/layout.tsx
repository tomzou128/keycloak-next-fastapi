import { Metadata } from "next";
import Providers from "./providers";
import Header from "@/components/common/header";
import { Container } from "@mui/material";
import { Inter } from "next/font/google";

// Load the Inter font
const inter = Inter({ subsets: ["latin"] });

// Define metadata for the application
export const metadata: Metadata = {
  title: "Keycloak Integration Demo",
  description: "A demo of Keycloak integration with Next.js and FastAPI",
};

/**
 * Root layout component
 *
 * This is the main layout component that wraps all pages.
 * It includes the providers, header, and main content area.
 *
 * @param props Component props
 * @returns The root layout component
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
    <body className={inter.className}>
    <Providers>
      <Header />
      <Container component="main" sx={{ py: 4 }}>
        {children}
      </Container>
    </Providers>
    </body>
    </html>
  );
}
