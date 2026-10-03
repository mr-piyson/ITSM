import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { canAccessControl } from "@/lib/ac/authorization.server";
import {
	listAccessControlDevices,
	listGroupDeviceChoices,
	toPublicDevice,
} from "@/lib/ac/devices";
import {
	countUsersInGroup,
	deviceIdsForGroup,
	getAcGroup,
	listAcGroups,
	usersInGroup,
} from "@/lib/ac/groups";
import { findAcUserPhoto } from "@/lib/ac/photos";
import {
	countUsersPerGroup,
	getAcUser,
	getAcUsersByIds,
	getGroupsForUser,
	listAcUsers,
} from "@/lib/ac/users";
import {
	AcDeviceListInputSchema,
	AcGroupIdInputSchema,
	AcGroupListInputSchema,
	AcUserDetailInputSchema,
	AcUserListInputSchema,
	PersonIdSchema,
} from "@/lib/ac/types";
import { protectedProcedure, router } from "@/server/trpc";

const acProcedure = protectedProcedure.use(async ({ ctx, next }) => {
	if (!(await canAccessControl(ctx.user))) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Access control permission required",
		});
	}
	return next({ ctx });
});

export const acRouter = router({
	/**
	 * Non-throwing permission probe so the UI can hide the access control
	 * sections instead of firing queries that would fail with FORBIDDEN.
	 */
	access: protectedProcedure.query(async ({ ctx }) => ({
		allowed: await canAccessControl(ctx.user),
	})),

	users: acProcedure
		.input(AcUserListInputSchema)
		.query(({ input }) => listAcUsers(input)),

	user: acProcedure.input(AcUserDetailInputSchema).query(async ({ input }) => {
		const user = await getAcUser(input.personId);
		if (!user) return null;
		const [groups, photo] = await Promise.all([
			getGroupsForUser(input.personId),
			findAcUserPhoto(input.personId),
		]);
		return { user, groups, photo };
	}),

	groups: acProcedure.input(AcGroupListInputSchema).query(async ({ input }) => {
		const result = await listAcGroups(input);
		const counts = await countUsersPerGroup(result.rows.map((g) => g.id));
		return {
			...result,
			rows: result.rows.map((group) => ({
				...group,
				userCount: counts.get(group.id) ?? 0,
			})),
		};
	}),

	group: acProcedure.input(AcGroupIdInputSchema).query(async ({ input }) => {
		const group = await getAcGroup(input.id);
		if (!group) return null;
		const [userCount, deviceIds] = await Promise.all([
			countUsersInGroup(input.id),
			deviceIdsForGroup(input.id),
		]);
		return { group, userCount, deviceIds };
	}),

	/** Member records, so the UI can show names without a second lookup. */
	groupUsers: acProcedure
		.input(AcGroupIdInputSchema)
		.query(async ({ input }) => getAcUsersByIds(await usersInGroup(input.id))),

	devices: acProcedure
		.input(AcDeviceListInputSchema)
		.query(async ({ input }) => {
			const devices = await listAccessControlDevices(input.activeOnly);
			return devices.map(toPublicDevice);
		}),

	deviceChoices: acProcedure
		.input(
			z.object({ deviceIds: z.array(z.number().int().positive()).default([]) }),
		)
		.query(async ({ input }) => {
			const devices = await listGroupDeviceChoices(input.deviceIds);
			return devices.map(toPublicDevice);
		}),

	personIdExists: acProcedure
		.input(z.object({ personId: PersonIdSchema }))
		.query(async ({ input }) => (await getAcUser(input.personId)) !== null),
});
