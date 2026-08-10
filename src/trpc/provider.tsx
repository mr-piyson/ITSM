"use client";

import {
	MutationCache,
	QueryCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";

import { toast } from "@/components/ui/toast";

import { trpc } from "./react";

function showErrorToast(error: unknown) {
	const description =
		error instanceof Error ? error.message : "Something went wrong";

	toast.add({
		title: "Request failed",
		description,
		type: "error",
		timeout: 5000,
	});
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				queryCache: new QueryCache({ onError: showErrorToast }),
				mutationCache: new MutationCache({ onError: showErrorToast }),
			}),
	);
	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				httpBatchLink({
					url: "/api/trpc",
				}),
			],
		}),
	);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</trpc.Provider>
	);
}
