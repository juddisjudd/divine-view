import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import PoE from "@/lib/providers/poe-provider";
import type { DefaultSession, NextAuthConfig } from "next-auth";

interface Session extends DefaultSession {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    PoE({
      clientId: process.env.POE_CLIENT_ID!,
      clientSecret: process.env.POE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }: { session: Session; user: User }) {
      if (session.user) {
        session.user.id = user.id;
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
  debug: true,
};
