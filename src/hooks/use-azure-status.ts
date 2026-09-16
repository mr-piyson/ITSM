import { trpc } from "@/trpc/react";
import type { AzureUserDetails } from "@/lib/azure-graph";

export function useAzureStatus(email: string | null) {
	const { data, isPending } = trpc.employees.azureStatus.useQuery(
		{ email: email ?? "" },
		{ enabled: !!email },
	);

	return {
		azure: data?.azure ?? null,
		isLoading: isPending && !!email,
	};
}
