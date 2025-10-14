"use server";

import { getUser } from "@/app/Auth/auth.actions";
import db from "@/lib/prisma";

export async function getRecords() {
	const account = await getUser();
	return account ? await db.record.findMany({}) : undefined;
}
