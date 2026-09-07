"use client";

import { useMemo, useState } from "react";

import { Loader2, Lock, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { UserFormDialog } from "./user-form-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import type { UserItem } from "@/server/routers/ITSM/users";
import { trpc } from "@/trpc/react";

export function UsersSettingsPage() {
	const { data: users, isPending } = trpc.users.list.useQuery();
	const utils = trpc.useUtils();
	const deactivateMutation = trpc.users.deactivate.useMutation();

	const [search, setSearch] = useState("");
	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState<UserItem | null>(null);
	const [resetting, setResetting] = useState<UserItem | null>(null);
	const [deleting, setDeleting] = useState<UserItem | null>(null);

	const filtered = useMemo(() => {
		if (!users) {
			return [];
		}
		const q = search.trim().toLowerCase();
		if (!q) {
			return users;
		}
		return users.filter((user) =>
			[user.name, user.username, user.email, user.type].some((field) =>
				field.toLowerCase().includes(q),
			),
		);
	}, [users, search]);

	const handleDelete = async () => {
		if (!deleting) {
			return;
		}
		try {
			await deactivateMutation.mutateAsync({ id: deleting.id });
			toast.success("User deleted");
			utils.users.list.invalidate();
			setDeleting(null);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete user",
			);
		}
	};

	return (
		<div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col space-y-4 overflow-auto p-4 md:p-6">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold tracking-tight">Users Management</h1>
					<p className="text-xs text-muted-foreground">
						Manage system users, their details and access.
					</p>
				</div>
				<Button onClick={() => setEditing(null)}>
					<Plus data-icon="inline-start" />
					Add User
				</Button>
			</div>

			<Card className="rounded-none">
				<CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
					<CardTitle className="flex items-center gap-2 text-base">
						<Users className="size-4" />
						System Users
					</CardTitle>
					<div className="relative w-full max-w-xs">
						<Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search users…"
							className="pl-8"
						/>
					</div>
				</CardHeader>
				<CardContent>
					{isPending ? (
						<div className="flex items-center justify-center py-10">
							<Loader2 className="size-6 animate-spin text-muted-foreground" />
						</div>
					) : filtered.length === 0 ? (
						<div className="py-10 text-center text-xs text-muted-foreground">
							No users found.
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Username</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Type</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filtered.map((user) => (
									<TableRow key={user.id}>
										<TableCell className="font-medium">{user.name}</TableCell>
										<TableCell>{user.username}</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>
											<Badge variant="secondary">{user.type}</Badge>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end gap-1">
												<Button
													variant="ghost"
													size="icon-sm"
													title="Edit user"
													onClick={() => {
														setEditing(user);
														setFormOpen(true);
													}}
												>
													<Pencil />
												</Button>
												<Button
													variant="ghost"
													size="icon-sm"
													title="Reset password"
													onClick={() => setResetting(user)}
												>
													<Lock />
												</Button>
												<Button
													variant="ghost"
													size="icon-sm"
													title="Delete user"
													onClick={() => setDeleting(user)}
												>
													<Trash2 />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<UserFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				user={editing}
				onSuccess={() => utils.users.list.invalidate()}
			/>

			<ResetPasswordDialog
				user={resetting}
				onClose={() => setResetting(null)}
			/>

			<AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete user?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently remove{" "}
							<strong>{deleting?.name ?? "this user"}</strong>. This action
							cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							disabled={deactivateMutation.isPending}
							onClick={handleDelete}
						>
							{deactivateMutation.isPending ? (
								<Loader2 className="animate-spin" />
							) : (
								<Trash2 />
							)}
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
