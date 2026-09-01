"use client";
import Image from "next/image";
import logo from "@/assets/images/logo.png";

type AppLogoProps = React.ComponentPropsWithoutRef<"div"> & {
	size?: number;
};

export default function AppLogo(props: AppLogoProps) {
	return (
		<div className="rounded-lg flex items-center justify-center">
			<Image
				src={logo}
				width={100}
				height={100}
				alt="MES Software"
				className="w-full h-full object-contain"
			/>
		</div>
	);
}
