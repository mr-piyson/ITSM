import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const url = request.nextUrl.searchParams.get("url");

	if (!url) {
		return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
	}

	try {
		const parsed = new URL(url);

		const allowedHostnames = ["intranet.bfginternational.com", "iss.bfginternational.com"];
		if (!allowedHostnames.includes(parsed.hostname)) {
			return NextResponse.json({ error: "Forbidden hostname" }, { status: 403 });
		}

		const response = await fetch(parsed.toString(), {
			headers: {
				Authorization: request.headers.get("Authorization") ?? "",
			},
		});

		if (!response.ok) {
			return NextResponse.json(
				{ error: `Upstream returned ${response.status}` },
				{ status: response.status },
			);
		}

		const contentType = response.headers.get("Content-Type") ?? "image/jpeg";
		const body = await response.arrayBuffer();

		return new NextResponse(body, {
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=86400, s-maxage=86400",
			},
		});
	} catch {
		return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
	}
}
