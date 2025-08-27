"use server";

import { iss } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET http://localhost:3000/api/Assets

export const GET = async () => {
  try {
    const contracts = await iss.contracts.findMany();
    return NextResponse.json(contracts, { status: 200 });
  } catch (error) {
    console.log("Error fetching contracts:", error);
    return new NextResponse(null, { status: 500 });
  }
};
