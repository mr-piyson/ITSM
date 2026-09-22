import { type NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "session_token";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
	const isAuthPage = pathname === "/auth";

	if (!sessionToken && !isAuthPage) {
		const url = new URL("/auth", request.url);
		if (pathname !== "/") {
			url.searchParams.set("next", pathname);
		}
		return NextResponse.redirect(url);
	}

	if (sessionToken && isAuthPage) {
		return NextResponse.redirect(new URL("/app", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
