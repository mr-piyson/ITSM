import { randomBytes } from "node:crypto";

import * as bcrypt from "bcrypt";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import { protectedProcedure, router } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

export type UserItem = {
	id: number;
	username: string;
	name: string;
	empCode: number;
	type: string;
	email: string;
};

function requireAdmin(userId: number, userType: string) {
	if (userType !== "admin") {
		throw new Error("Only admins can manage users");
	}
}

function hashPassword(password: string): string {
	return bcrypt.hashSync(password, 10);
}

function generateToken(): string {
	return randomBytes(32).toString("hex");
}

function normalizeUser(row: Row): UserItem {
	return {
		id: Number(row.id),
		username: String(row.username ?? ""),
		name: String(row.name ?? ""),
		empCode: Number(row.empCode ?? 0),
		type: String(row.type ?? ""),
		email: String(row.email ?? ""),
	};
}

export const usersRouter = router({
	list: protectedProcedure.query(async ({ ctx }): Promise<UserItem[]> => {
		requireAdmin(ctx.user.id, ctx.user.type);

		const [rows] = await ctx.db.iss.execute<Row[]>(
			`SELECT id, username, name, empCode, type, email
			 FROM users
			 ORDER BY empCode ASC`,
		);
		return rows.map(normalizeUser);
	}),

	create: protectedProcedure
		.input(
			z.object({
				username: z.string().trim().min(1).max(50),
				name: z.string().trim().min(1).max(50),
				email: z.string().trim().min(1).max(100).email(),
				password: z.string().min(6).max(255),
				type: z.string().trim().min(1).max(50),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			requireAdmin(ctx.user.id, ctx.user.type);

			const [duplicates] = await ctx.db.iss.execute<Row[]>(
				`SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1`,
				[input.username, input.email],
			);
			if (duplicates.length > 0) {
				throw new Error("Username or email already exists");
			}

			const [maxRows] = await ctx.db.iss.execute<Row[]>(
				`SELECT MAX(empCode) AS maxCode FROM users`,
			);
			const nextEmpCode = Number(maxRows[0]?.maxCode ?? 0) + 1;

			const hashedPassword = hashPassword(input.password);
			const token = generateToken();

			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`INSERT INTO users (username, name, empCode, type, email, password, token)
				 VALUES (?, ?, ?, ?, ?, ?, ?)`,
				[
					input.username,
					input.name,
					nextEmpCode,
					input.type,
					input.email,
					hashedPassword,
					token,
				],
			);

			return { success: true, id: result.insertId };
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.coerce.number().int().positive(),
				username: z.string().trim().min(1).max(50),
				name: z.string().trim().min(1).max(50),
				email: z.string().trim().min(1).max(100).email(),
				type: z.string().trim().min(1).max(50),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			requireAdmin(ctx.user.id, ctx.user.type);

			const [existing] = await ctx.db.iss.execute<Row[]>(
				`SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ? LIMIT 1`,
				[input.username, input.email, input.id],
			);
			if (existing.length > 0) {
				throw new Error("Username or email already exists");
			}

			await ctx.db.iss.execute(
				`UPDATE users SET username = ?, name = ?, email = ?, type = ?
				 WHERE id = ?`,
				[input.username, input.name, input.email, input.type, input.id],
			);

			return { success: true };
		}),

	resetPassword: protectedProcedure
		.input(
			z.object({
				id: z.coerce.number().int().positive(),
				password: z.string().min(6).max(255),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			requireAdmin(ctx.user.id, ctx.user.type);

			const hashedPassword = hashPassword(input.password);

			await ctx.db.iss.execute(
				`UPDATE users SET password = ? WHERE id = ?`,
				[hashedPassword, input.id],
			);

			return { success: true };
		}),

	deactivate: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			requireAdmin(ctx.user.id, ctx.user.type);

			if (input.id === ctx.user.id) {
				throw new Error("Cannot delete your own account");
			}

			await ctx.db.iss.execute(`DELETE FROM users WHERE id = ?`, [input.id]);

			return { success: true };
		}),
});
