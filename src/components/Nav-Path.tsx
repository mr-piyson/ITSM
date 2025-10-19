import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
} from "./ui/breadcrumb";
import { Button } from "./ui/button";

export const NavPath: React.FC = () => {
	const pathname = usePathname();
	const activity = pathname.split("/").slice(2, 3).join("/");
	const router = useRouter();
	return (
		<Breadcrumb>
			<BreadcrumbList className="flex-nowrap">
				<Button variant="ghost" className=" h-full p-1 px-2">
					<BreadcrumbItem>
						<BreadcrumbLink
							onClick={() => {
								router.push(`/App/${activity}`);
							}}
							className="text-lg"
						>
							{activity}
						</BreadcrumbLink>
					</BreadcrumbItem>
				</Button>
			</BreadcrumbList>
		</Breadcrumb>
	);
};

export function NavRecordItem(props: any) {
	return (
		<Button variant={"ghost"} className="p-1 px-2">
			<BreadcrumbItem>
				<Avatar>
					<AvatarImage src={props.src} alt="Record Image" />
					<AvatarFallback>RM</AvatarFallback>
				</Avatar>
				<span className="text-sm truncate font-semibold ps-1 text-foreground">
					{props.title}
				</span>
			</BreadcrumbItem>
		</Button>
	);
}
