import { Suspense } from "react";

type MesLayoutProps = {
	children?: React.ReactNode;
};

export default function MesLayout(props: MesLayoutProps) {
	return (
		<main className="h-screen">
			<Suspense>{props.children}</Suspense>
		</main>
	);
}
