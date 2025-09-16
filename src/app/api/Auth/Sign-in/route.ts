import { iss } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 1 day

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    try {
      const { email, password } = (await req.json()) as {
        email: string;
        password: string;
      };

      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }

      const account = await iss.users.findFirst({
        where: {
          email: email.toLowerCase(),
        },
      });
      // Verify password (in a real app, use hashed passwords and a library like bcrypt)
      // Here we assume the password is stored in plain text for simplicity (not recommended)
      if (!account) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      } else {
        // Generate session token
        const expiresAt = new Date(Date.now() + SESSION_DURATION);

        // Set the session token in cookies
        (await cookies()).set({
          name: "session_token",
          value: account.token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: expiresAt,
          path: "/",
        });
        return NextResponse.json({ success: true }, { status: 200 });
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      return new NextResponse(null, { status: 500 });
    }
  } else {
    console.log("Method not allowed");
    return new NextResponse(null, { status: 405 });
  }
}
