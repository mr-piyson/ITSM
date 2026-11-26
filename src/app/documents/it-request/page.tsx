import { ITRequestPage } from "@/apps/itsm/it-request/it-request-page";
import { MisRequired } from "@/apps/itsm/requests/mis-required";
import { RequestLogin } from "@/apps/itsm/requests/request-login";
import { getPageRequester } from "@/apps/itsm/requests/requester.server";

export default async function Page() {
	// All request forms use the same Microsoft/ISS session and MIS requester gate.
	const { signedIn, requester } = await getPageRequester();
	if (!signedIn) {
		return <RequestLogin next="/documents/it-request" />;
	}
	if (!requester) {
		return <MisRequired />;
	}
	return <ITRequestPage />;
}
