import { MarketingNavbar } from "@/layout/shell/marketing-navbar";

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
