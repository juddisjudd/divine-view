import { createTRPCRouter } from "../trpc";

export const appRouter = createTRPCRouter({
  // No routers currently
});

export type AppRouter = typeof appRouter;
