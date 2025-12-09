"use server";

import db from "@/lib/database";

export const getAllEmployees = async () => {
  const employees = await db.employees.findMany({});
  return employees;
};
