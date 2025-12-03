import PoE from "@/lib/providers/poe-provider";
import type { NextAuthConfig } from "next-auth";
import "@/types/auth"; // Import type declarations

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
      // Store PoE access token in JWT for API calls
      if (account?.access_token) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      if (profile) {
        token.id = profile.id;
        token.name = profile.name;
        token.image = profile.avatar;
      }
      return token;
    },
    async session({ session, token }) {
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
