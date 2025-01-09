import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/trpc/routers/_app";

export const api = createTRPCReact<AppRouter>();

export type RouterInputs = {
  [K in keyof AppRouter]: AppRouter[K] extends { input: infer T } ? T : never;
};

export type RouterOutputs = {
  [K in keyof AppRouter]: AppRouter[K] extends { output: infer T } ? T : never;
};
