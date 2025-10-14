"use server";

import type { Account } from "@prisma/client";
import * as bcrypt from "bcrypt";
import type { z } from "zod";
import db from "@/lib/prisma";
import type { SignInSchema } from "./Account-Dialog";

export async function getAccounts(): Promise<Account[]> {
	const account = await db.account.findMany({});
	return account;
}

export async function getAccountByEmail(
	email: string,
): Promise<Account | null> {
	const account = await db.account.findUnique({
		where: { email: email },
	});
	return account;
}

export async function createAccount(data: z.infer<typeof SignInSchema>) {
	const account = await getAccountByEmail(data.email);
	if (account) {
		return { error: "Account already exists" };
	}

	const saltRounds = 10;

	const hashedPassword = await bcrypt.hash(data.password, saltRounds);

	const newAccount = await db.account.create({
		data: {
			name: data.name,
			email: data.email,
			image: data.image,
			password: hashedPassword,
			role: data.role,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	});
	return newAccount;
}

export async function updateAccount(
	id: string,
	data: Partial<z.infer<typeof SignInSchema>>,
) {
	const account = await db.account.update({
		where: { id: id },
		data: {
			name: data.name,
			email: data.email,
			image: data.image,
			password: data.password,
			role: data.role,
			updatedAt: new Date(),
		},
	});
	return account;
}

export async function deleteAccount(id: string) {
	const account = await db.account.delete({
		where: { id: id },
	});
	return account;
}
