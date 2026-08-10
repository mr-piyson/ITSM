import { createCallerFactory } from "@trpc/server";

import { createContext } from "@/server/context";
import { appRouter } from "@/server/root";

const createCaller = createCallerFactory(appRouter);

export const serverClient = createCaller(async (opts) => createContext(opts));
