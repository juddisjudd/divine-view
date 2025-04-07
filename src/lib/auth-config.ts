import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import Discord from "next-auth/providers/discord";
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
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
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
};
