import { createContext } from "@/server/context";
import { appRouter } from "@/server/root";

export const serverClient = appRouter.createCaller(() => createContext());
