import { SplashScreen } from "@/components/Splash-Screen";
import AppShell from "@/layout/ITSM/shell/app-shell";

export default function Layout(props: any) {
	return (
		<SplashScreen>
			<AppShell>{props.children}</AppShell>
		</SplashScreen>
	);
}
