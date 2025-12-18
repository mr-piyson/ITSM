"use server";

import PrinterManagement from "./printers-page";
export default async function PrintersPage() {
  return <PrinterManagement printers={[]} />;
}
