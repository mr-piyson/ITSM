"use server";

import type { printers } from "@prisma/client";
import db from "@/lib/prisma";
import PrinterManagement from "./printers-page";
export default async function PrintersPage() {
	const printers = (await db.printers.findMany({
		select: {
			id: true,
			name: true,
			location: true,
			department: true,
			img: true,
			usedBy: true,
		},
	})) as printers[];

	return <PrinterManagement printers={printers} />;
}
