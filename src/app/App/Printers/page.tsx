"use server";

import { iss } from "@/lib/prisma";
import PrinterManagement from "./printers-page";

type PrintersLayoutProps = {
  children?: React.ReactNode;
};

export default async function PrintersLayout(props: PrintersLayoutProps) {
  const printers = await iss.printers.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      department: true,
      img: true,
      usedBy: true,
    },
  });

  return <PrinterManagement printers={printers} />;
}
