import { mes } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (req.method === "GET") {
    try {
      const { searchParams } = new URL(req.url);
      const skip = parseInt(searchParams.get("skip") || "0", 10);
      const take = parseInt(searchParams.get("take") || "20", 10); // default 20

      const employees = await mes.employees.findMany({
        skip,
        take,
        select: {
          id: true,
          emp_code: true,
          name: true,
          department: true,
          designation: true,
          left_date: true,
          telephone: true,
          nationality: true,
          emp_location: true,
          emp_source: true,
          access: true,
          is_active: true,
        },
      });

      const employeesWithPhoto = await Promise.all(
        employees.map(async (emp) => {
          const photo = await mes.resources.findFirst({
            where: { uid: String(emp.id), model: "employee" },
            select: { folder: true, filename: true, ext: true },
          });
          return {
            ...emp,
            photo: photo ?? null,
          };
        })
      );

      return new NextResponse(JSON.stringify(employeesWithPhoto), {
        status: 200,
      });
    } catch (error) {
      console.log(error);
      return new NextResponse(null, { status: 500 });
    }
  } else {
    return new NextResponse(null, { status: 405 });
  }
}
