import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { handleSignIn, handleSignOut } from "@/lib/auth.server";
import { publicProcedure, router } from "@/server/trpc";

export const authRouter = router({
	me: publicProcedure.query(({ ctx }) => ctx.user),

	signIn: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				password: z.string().min(1),
			}),
		)
		.mutation(async ({ input }) => {
			const result = await handleSignIn(input.email, input.password);
			if (result.error) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: result.error,
				});
			}
			return result.data;
		}),

	signOut: publicProcedure.mutation(async () => {
		await handleSignOut();
		return { success: true };
	}),
});
