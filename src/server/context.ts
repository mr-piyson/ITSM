import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

import { getUser } from "@/app/auth/auth.server";
import db from "@/lib/database";

export async function createContext(opts: FetchCreateContextFnOptions) {
	const user = await getUser();

	return {
		db,
		user,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
