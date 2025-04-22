import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import PoE from "@/lib/providers/poe-provider";
import { DefaultSession } from "next-auth";

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

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    PoE({
      clientId: process.env.POE_CLIENT_ID as string,
      clientSecret: process.env.POE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    session({ session, user }: { session: Session; user: User }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  secret: process.env.AUTH_SECRET,
};
