import { initTRPC, TRPCError } from "@trpc/server";

import { getEmployeeByEmail } from "@/lib/oracle-employees.server";

import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
	}
	return next({ ctx: { user: ctx.user } });
});

/**
 * A signed-in ISS user is not necessarily a requester: their email must also
 * resolve to an active MIS employee. Used by every request route.
 */
export const requesterProcedure = protectedProcedure.use(async ({ ctx, next }) => {
	const requester = ctx.user.email
		? await getEmployeeByEmail(ctx.user.email)
		: null;
	if (!requester) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Your email is not in MIS",
		});
	}
	return next({ ctx: { requester } });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
	if (ctx.user.type !== "admin") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Only admins can perform this action",
		});
	}
	return next();
});
