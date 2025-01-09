import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const createFilterSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  githubUrl: z.string().url(),
  tags: z.array(z.string()),
});

export const filterRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ tag: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const filters = await ctx.prisma.filter.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          votes: true,
        },
        where: input?.tag
          ? {
              tags: {
                some: {
                  tag: {
                    name: input.tag,
                  },
                },
              },
            }
          : undefined,
        orderBy: {
          createdAt: "desc",
        },
      });

      return filters.map((filter) => ({
        id: filter.id,
        name: filter.name,
        description: filter.description,
        githubUrl: filter.githubUrl,
        downloads: filter.downloads,
        tags: filter.tags.map((filterTag) => filterTag.tag.name),
        author: {
          id: filter.user.id,
          name: filter.user.name,
          image: filter.user.image,
        },
        votes: {
          upvotes: filter.votes.filter((vote) => vote.value === 1).length,
          downvotes: filter.votes.filter((vote) => vote.value === -1).length,
          userVote: filter.votes.find(
            (vote) => vote.userId === ctx.session?.user?.id
          )?.value,
        },
        createdAt: filter.createdAt,
        updatedAt: filter.updatedAt,
      }));
    }),

  create: protectedProcedure
    .input(createFilterSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.filter.create({
        data: {
          name: input.name,
          description: input.description,
          githubUrl: input.githubUrl,
          userId: ctx.session.user.id,
          tags: {
            create: input.tags.map((tagName) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: { name: tagName },
                },
              },
            })),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          votes: true,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        githubUrl: z.string().url().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const filter = await ctx.prisma.filter.findUnique({
        where: { id: input.id },
        include: {
          tags: true,
        },
      });

      if (!filter) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Filter not found",
        });
      }

      if (filter.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to update this filter",
        });
      }

      return ctx.prisma.filter.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          githubUrl: input.githubUrl,
          tags: input.tags
            ? {
                deleteMany: {},
                create: input.tags.map((tagName) => ({
                  tag: {
                    connectOrCreate: {
                      where: { name: tagName },
                      create: { name: tagName },
                    },
                  },
                })),
              }
            : undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          votes: true,
        },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const filter = await ctx.prisma.filter.findUnique({
        where: { id: input.id },
      });

      if (!filter) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Filter not found",
        });
      }

      if (filter.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to delete this filter",
        });
      }

      await ctx.prisma.filterTag.deleteMany({
        where: { filterId: input.id },
      });

      await ctx.prisma.vote.deleteMany({
        where: { filterId: input.id },
      });

      return ctx.prisma.filter.delete({
        where: { id: input.id },
      });
    }),

  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const filter = await ctx.prisma.filter.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          votes: true,
        },
      });

      if (!filter) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Filter not found",
        });
      }

      return {
        id: filter.id,
        name: filter.name,
        description: filter.description,
        githubUrl: filter.githubUrl,
        downloads: filter.downloads,
        tags: filter.tags.map((filterTag) => filterTag.tag.name),
        author: {
          id: filter.user.id,
          name: filter.user.name,
          image: filter.user.image,
        },
        votes: {
          upvotes: filter.votes.filter((vote) => vote.value === 1).length,
          downvotes: filter.votes.filter((vote) => vote.value === -1).length,
          userVote: filter.votes.find(
            (vote) => vote.userId === ctx.session?.user?.id
          )?.value,
        },
        createdAt: filter.createdAt,
        updatedAt: filter.updatedAt,
      };
    }),
});
