import { redirect } from "next/navigation";
import { SplashScreen } from "@/components/Splash-Screen";
import { getUser } from "../Auth/auth.actions";
import App from "./App";

export default async function Activity_Layout(props: any) {
	const user = await getUser();
	if (!user) redirect("/Auth");
	return (
		<SplashScreen>
			<App account={user}>{props.children}</App>
		</SplashScreen>
	);
}
