import { requireAuth } from "@/lib/auth.server";
import { getEmployeeByEmail } from "@/lib/oracle-employees.server";

/** Server-side requester check shared by the public request pages. */
export async function getPageRequester() {
	const user = await requireAuth();
	if (!user) {
		throw new Error("Not authenticated");
	}
	return user.email ? await getEmployeeByEmail(user.email) : null;
}
