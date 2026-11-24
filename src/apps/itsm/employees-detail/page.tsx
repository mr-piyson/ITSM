import { EmployeeDetailPage } from "@/apps/itsm/employees/employee-detail-page";

export async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return <EmployeeDetailPage code={decodeURIComponent(id)} />;
}
