import { createTRPCRouter } from "../trpc";
import { filterRouter } from "./filter";
import { voteRouter } from "./vote";

export const appRouter = createTRPCRouter({
  filter: filterRouter,
  vote: voteRouter,
});

export type AppRouter = typeof appRouter;
