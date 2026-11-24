import { MarketingNavbar } from "@/apps/itsm/shell/marketing-navbar";

type RequestsLayoutProps = {
	children?: React.ReactNode;
};

export default function RequestsLayout(props: RequestsLayoutProps) {
	return (
		<div>
			<MarketingNavbar />
			{props.children}
		</div>
	);
}
