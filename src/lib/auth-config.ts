import PoE from "@/lib/providers/poe-provider";
import type { NextAuthConfig } from "next-auth";
import "@/types/auth"; // Import type declarations
import { refreshAccessToken } from "@/utils/refresh-token";

export const authConfig: NextAuthConfig = {
  // Use JWT strategy instead of database
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    PoE({
      clientId: process.env.POE_CLIENT_ID!,
      clientSecret: process.env.POE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Initial sign in - store tokens from OAuth provider
      if (account?.access_token) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          id: profile?.id || token.id,
          name: profile?.name || token.name,
          image: profile?.avatar || token.image,
        };
      }

      // Return previous token if it hasn't expired yet
      // Check if token expires in more than 5 minutes (300 seconds)
      const timeUntilExpiry = (token.expiresAt as number) - Math.floor(Date.now() / 1000);
      if (timeUntilExpiry > 300) {
        return token;
      }

      // Token is expired or about to expire, try to refresh it
      console.log('[Auth] Token expiring soon, attempting refresh...');
      const refreshedTokens = await refreshAccessToken(token.refreshToken as string);

      if (!refreshedTokens) {
        console.error('[Auth] Token refresh failed, marking for re-authentication');
        // Refresh failed - mark token as expired to force re-auth
        return {
          ...token,
          error: 'RefreshAccessTokenError',
        };
      }

      console.log('[Auth] Token refreshed successfully');
      return {
        ...token,
        accessToken: refreshedTokens.accessToken,
        refreshToken: refreshedTokens.refreshToken,
        expiresAt: refreshedTokens.expiresAt,
      };
    },
    async session({ session, token }) {
      // If token refresh failed, the session is invalid
      if (token.error === 'RefreshAccessTokenError') {
        // Force re-authentication by returning null session
        return {
          ...session,
          error: 'RefreshAccessTokenError',
        };
      }

      // Pass data from JWT to session
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          image: token.image as string,
          accessToken: token.accessToken as string,
        };
      }
      return session;
    },
    async signIn(params) {
      console.log("SignIn callback:", params);
      return true;
    },
  },
  events: {
    async signIn(params) {
      console.log("SignIn event:", params);
    },
    async signOut(params) {
      console.log("SignOut event:", params);
    },
  },
  pages: {
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
};
