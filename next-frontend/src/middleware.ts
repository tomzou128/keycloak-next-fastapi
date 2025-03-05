import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * NextAuth.js middleware
 *
 * This middleware protects routes that require authentication.
 * It redirects unauthenticated users to the home page.
 */
export default withAuth(
  function middleware(req) {
    // Check if the user is authenticated
    if (!req.nextauth.token) {
      // Redirect to the home page if not authenticated
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only run the middleware on protected routes
      authorized: ({ token }) => !!token,
    },
  },
);

/**
 * Define the routes that require authentication
 *
 * This configures the middleware to only run on these paths
 */
export const config = {
  matcher: ["/dashboard/:path*", "/items/:path*", "/profile/:path*", "/profile", "/admin/:path*"],
};
