import { redirect } from "next/navigation";

import AppLogo from "@/assets/icons/Logo";

import SignInTab from "./SignIn";
import { TabSwitcher } from "./TabSwitcher";
import { getUser } from "./auth.actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Auth(props: any) {
	const session = await getUser();
	if (session) redirect("/app");

	return (
		<div className=" relative items-center justify-center ">
			<div className=" max-md:hidden flex justify-between relative h-full flex-col bg-muted-foreground p-10 text-card-foreground lg:flex dark:border-r sm:hidden">
				<div className=" absolute inset-0 bg-muted " />
				<div className=" relative  flex items-center text-3xl font-medium gap-2">
					<AppLogo className="w-12 h-12" />
					<span>ITSM</span>
				</div>
				{/* <ImageSlider /> */}
				<div className="relative "></div>
			</div>
			<div className="w-full h-full flex flex-col justify-center items-center ">
				<Tabs
					defaultValue="Sign-In"
					className="max-sm:w-full max-sm:p-2 sm:w-[420px]"
				>
					<TabsList className="grid w-full grid-cols-1">
						<TabsTrigger value="Sign-In">Sign In</TabsTrigger>
					</TabsList>
					<TabsContent value="Sign-In">
						<SignInTab />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
