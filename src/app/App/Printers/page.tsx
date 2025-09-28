"use server";

import { iss } from "@/lib/prisma";
import PrinterManagement from "./printers-page";
import { type printers as Printer } from "@prisma/iss";
export default async function PrintersPage() {
  const printers = (await iss.printers.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      department: true,
      img: true,
      usedBy: true,
    },
  })) as Printer[];

  return <PrinterManagement printers={printers} />;
}
