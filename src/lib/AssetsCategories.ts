import {
	Building,
	Camera,
	HardDrive,
	Laptop,
	Monitor,
	Phone,
	Projector,
	Router,
	Server,
	Shield,
	Tablet,
	Tv,
	Wifi,
	Zap,
} from "lucide-react";

export const assetCategories = {
	"Computing Devices": [
		{ name: "Desktop", icon: Monitor, color: "blue" },
		{ name: "Laptop", icon: Laptop, color: "slate" },
		{ name: "Tablet", icon: Tablet, color: "pink" },
	],
	"Display & Media": [
		{ name: "Monitor", icon: Monitor, color: "amber" },
		{ name: "TV", icon: Tv, color: "violet" },
		{ name: "Display Projector", icon: Projector, color: "sky" },
	],
	"Security & Access": [
		{ name: "Face Access", icon: Camera, color: "purple" },
		{ name: "CCTV", icon: Camera, color: "green" },
		{ name: "Firewall", icon: Shield, color: "red" },
	],
	"Network Equipment": [
		{ name: "Wifi Access Point", icon: Wifi, color: "cyan" },
		{ name: "Switches", icon: Router, color: "indigo" },
		{ name: "Router", icon: Router, color: "stone" },
		{ name: "P2P Network", icon: Router, color: "lime" },
	],
	Infrastructure: [
		{ name: "Blade Server", icon: Server, color: "teal" },
		{ name: "UPS", icon: Zap, color: "yellow" },
		{ name: "Tape Drive", icon: HardDrive, color: "orange" },
		{ name: "AC", icon: Building, color: "emerald" },
	],
	Communication: [{ name: "Telephone", icon: Phone, color: "rose" }],
} as const;
