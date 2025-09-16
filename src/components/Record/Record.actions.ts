"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/app/Auth/auth.actions";

export async function getRecords() {
  const account = await getUser();
  return account ? await prisma.record.findMany({}) : undefined;
}
