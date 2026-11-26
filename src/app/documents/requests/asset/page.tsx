import { MisRequired } from "@/apps/itsm/requests/mis-required";
import { RequestFormPage } from "@/apps/itsm/requests/request-form-page";
import { RequestLogin } from "@/apps/itsm/requests/request-login";
import { getPageRequester } from "@/apps/itsm/requests/requester.server";

export default async function Page() {
	const { signedIn, requester } = await getPageRequester();
	if (!signedIn) {
		return <RequestLogin next="/documents/requests/asset" />;
	}
	if (!requester) {
		return <MisRequired />;
	}
	return <RequestFormPage kind="asset" />;
}
