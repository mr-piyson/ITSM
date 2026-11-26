import { getUser } from "@/lib/auth.server";
import { getEmployeeByEmail } from "@/lib/oracle-employees.server";

/**
 * Server-side gate for the public request pages.
 *
 * The caller decides what to render when `signedIn` is false (the request-only
 * Microsoft login) versus when no MIS employee matches (the MIS error page).
 */
export async function getPageRequester() {
	const user = await getUser();
	if (!user) {
		return { signedIn: false as const, requester: null };
	}

	const requester = user.email ? await getEmployeeByEmail(user.email) : null;
	return { signedIn: true as const, requester };
}
