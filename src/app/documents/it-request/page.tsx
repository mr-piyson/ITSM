import { ITRequestPage } from "@/apps/itsm/it-request/it-request-page";
import { MisRequired } from "@/apps/itsm/requests/mis-required";
import { getPageRequester } from "@/apps/itsm/requests/requester.server";

export default async function Page() {
	// All request forms use the same Microsoft/ISS session and MIS requester gate.
	const requester = await getPageRequester();
	if (!requester) {
		return <MisRequired />;
	}
	return <ITRequestPage />;
}
