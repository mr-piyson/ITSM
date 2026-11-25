import { MisRequired } from "@/apps/itsm/requests/mis-required";
import { RequestFormPage } from "@/apps/itsm/requests/request-form-page";
import { getPageRequester } from "@/apps/itsm/requests/requester.server";

export default async function Page() {
	const requester = await getPageRequester();
	if (!requester) {
		return <MisRequired />;
	}
	return <RequestFormPage kind="asset" />;
}
