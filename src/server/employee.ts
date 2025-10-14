"use server";

import db from "@/lib/prisma";

export const getAllEmployees = async () => {
	const employees = await db.employees.findMany({});
	return employees;
};
