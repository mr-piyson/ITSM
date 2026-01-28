"use server"

import * as bcrypt from "bcrypt"
import { RowDataPacket } from "mysql2"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { z } from "zod"

import db from "@/lib/database"

import type { SignInSchema } from "./SignIn"

// Session duration in milliseconds (1 days)
const SESSION_DURATION = 24 * 60 * 60 * 1000

// Interface for user session

type UserRow = RowDataPacket & {
  name: string
  id: number
  username: string
  password: string
  empCode: number
  type: string
  token: string
  email: string
}
/**
 * Get the current user session from the cookies
 */
export async function getUser(): Promise<UserRow | null> {
  const sessionToken = (await cookies()).get("session_token")?.value
  if (!sessionToken) {
    return null
  }

  const [rows] = await db.iss.query<UserRow[]>(
    "SELECT * FROM ISS.users WHERE token = ?",
    [sessionToken]
  )

  const user = rows[0] ?? null

  return user
}

export async function signIn(formData: z.infer<typeof SignInSchema>) {
  const email = formData.email as string
  const password = formData.password as string

  if (!email || !password) {
    return {
      error: "Email and password are required",
    }
  }

  try {
    const [resAccount] = await db.iss.execute<UserRow[]>(
      `select * from ISS.users where email = '${email}' limit 1;`
    )
    const account = resAccount[0] as UserRow | undefined

    // Verify password (in a real app, use hashed passwords and a library like bcrypt)
    // Here we assume the password is stored in plain text for simplicity (not recommended)
    if (!account) {
      return {
        data: undefined,
        error: "Invalid email or password",
        status: 401,
      }
    } else {
      // change $2y$ to $2b$
      account.password = account.password.replace("$2y$", "$2b$")
      const passwordMatch = await bcrypt.compare(password, account.password)
      if (!passwordMatch) {
        return {
          data: undefined,
          error: "Invalid email or password",
          status: 401,
        }
      }

      // Generate session token
      const expiresAt = new Date(Date.now() + SESSION_DURATION)

      // Set the session token in cookies
      ;(await cookies()).set({
        name: "session_token",
        value: account.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
      })
      return {
        data: account,
        error: undefined,
        status: 200,
      }
    }
  } catch (error) {
    console.error("Sign in error:", error)
    return {
      error: "Authentication failed",
    }
  }
}

/**
 * Sign out the current user by removing the session
 */
export async function signOut() {
  const sessionToken = (await cookies()).get("session_token")?.value

  // if (sessionToken) {
  //   try {
  //     // Delete the session from the database
  //     await prisma.session.delete({
  //       where: {
  //         token: sessionToken,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Error deleting session:", error);
  //   }
  // }

  // Delete the session cookie
  ;(await cookies()).delete("session_token")

  // Redirect to the home page
  redirect("/auth")
}

/**
 * Protect a route by checking if the user is authenticated
 */
export async function requireAuth() {
  const session = await getUser()

  if (!session) redirect("/auth")

  return session
}
