import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const voteRouter = createTRPCRouter({
  vote: protectedProcedure
    .input(
      z.object({
        filterId: z.string(),
        value: z.union([z.literal(1), z.literal(-1)]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const filter = await ctx.prisma.filter.findUnique({
        where: { id: input.filterId },
      });

      if (!filter) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Filter not found",
        });
      }

      return ctx.prisma.vote.upsert({
        where: {
          filterId_userId: {
            filterId: input.filterId,
            userId: ctx.session.user.id,
          },
        },
        create: {
          filterId: input.filterId,
          userId: ctx.session.user.id,
          value: input.value,
        },
        update: {
          value: input.value,
        },
      });
    }),

  removeVote: protectedProcedure
    .input(
      z.object({
        filterId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.vote.delete({
        where: {
          filterId_userId: {
            filterId: input.filterId,
            userId: ctx.session.user.id,
          },
        },
      });
    }),
});
