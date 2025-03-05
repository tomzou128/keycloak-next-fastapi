import { NextAuthOptions, TokenSet } from "next-auth";
import { JWT } from "next-auth/jwt";
import KeycloakProvider from "next-auth/providers/keycloak";
import { User } from "@/lib/types";
import { signOut } from "next-auth/react";


/**
 * Updates the access token using the refresh token
 *
 * @param token The existing token
 * @returns The updated token
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    // Prepare the refresh token request
    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    const params = new URLSearchParams({
      client_id: process.env.KEYCLOAK_CLIENT_ID,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken as string,
    });

    // Make the refresh token request
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: params,
      cache: "no-cache",
    });

    // Parse the response
    const refreshedTokens: TokenSet = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    // Calculate the new expiration time
    const now = Math.floor(Date.now() / 1000);
    const accessTokenExpires = now + refreshedTokens.expires_at!;

    // Return the updated token
    return {
      ...token,
      idToken: refreshedTokens.id_token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);

    // Return the existing token with an error flag
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export async function federatedLogout() {
  try {
    const response = await fetch("/api/auth/federated-logout");
    const data = await response.json();
    if (response.ok) {
      await signOut({ redirect: false });
      window.location.href = data.url;
      return;
    }
    throw new Error(data.error);
  } catch (error) {
    console.error(error);
    await signOut({ redirect: false });
    window.location.href = "/";
  }
}

/**
 * NextAuth.js options
 *
 * This configuration sets up NextAuth.js with the Keycloak provider
 */
export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    /**
     * Callback executed when a JWT is created or updated
     *
     * @param params Parameters containing the token, user, account, etc.
     * @returns The updated token
     */
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        console.log("account", account);
        console.log("user", user);
        // Calculate the expiration time
        const accessTokenExpires = account.expires_at ?? 0;

        // Store the tokens and user info in the JWT
        return {
          idToken: account.id_token,
          accessToken: account.access_token,
          accessTokenExpires,
          refreshToken: account.refresh_token,
          user,
        };
      }

      // Return the token if it's still valid
      const now = Math.floor(Date.now() / 1000);
      if (now < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },

    /**
     * Callback executed when a session is checked
     *
     * @param params Parameters containing the session and token
     * @returns The updated session
     */
    async session({ session, token }) {
      // Add the access token and user to the session
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      session.user = token.user as User;
      return session;
    },

  },
  pages: {
    signIn: "/", // Custom sign-in page
    signOut: "/", // Custom sign-out page
    error: "/", // Error page
  },
};
