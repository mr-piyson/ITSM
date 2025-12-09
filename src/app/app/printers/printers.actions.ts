"use server";

import db from "@/lib/database";

export const getPrinters = async () => {
  try {
    const printers = await db.printers.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        department: true,
        img: true,
      },
    });
    return {
      data: printers,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: "Error fetching printers",
    };
  }
};
