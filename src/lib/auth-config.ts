import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import Discord from "next-auth/providers/discord";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    session({ session, user }: { session: any, user: any }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};