import { SplashScreen } from "@/components/Splash-Screen";
import AppShell from "@/layout/ITSM/shell/app-shell";

export default function Layout(props: any) {
	return (
		<div className="relative h-svh">
			<SplashScreen>
				<AppShell>{props.children}</AppShell>
			</SplashScreen>
		</div>
	);
}