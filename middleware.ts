import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	const sessionToken = request.cookies.get("session_token")?.value;

	if (sessionToken) {
		return NextResponse.redirect(new URL("/app", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/auth"],
};
