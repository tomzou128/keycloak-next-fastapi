import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * NextAuth.js API route
 *
 * This route handles all authentication flows, including:
 * - Sign in
 * - Sign out
 * - Session management
 * - Callbacks
 *
 * It uses the configuration defined in @/lib/auth.ts
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
