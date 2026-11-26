import { MisRequired } from "@/apps/itsm/requests/mis-required";
import { RequestKindsPage } from "@/apps/itsm/requests/request-kinds-page";
import { RequestLogin } from "@/apps/itsm/requests/request-login";
import { getPageRequester } from "@/apps/itsm/requests/requester.server";

export default async function Page() {
	const { signedIn, requester } = await getPageRequester();
	if (!signedIn) {
		return <RequestLogin next="/documents/requests" />;
	}
	if (!requester) {
		return <MisRequired />;
	}
	return <RequestKindsPage />;
}
