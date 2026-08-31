import type { SyncPhotoEmployee } from "@/server/routers/ITSM/sync-photos";

export const SYNC_STATUS_LABELS: Record<
	SyncPhotoEmployee["syncStatus"],
	string
> = {
	synced: "Synced",
	different: "Different",
	not_in_oracle: "Not in Oracle",
	no_photo: "No Photo",
};

export function syncStatusBadgeClass(
	status: SyncPhotoEmployee["syncStatus"],
): string {
	switch (status) {
		case "synced":
			return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200";
		case "different":
			return "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200";
		case "not_in_oracle":
			return "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200";
		case "no_photo":
			return "bg-muted text-muted-foreground dark:bg-muted/60 dark:text-muted-foreground";
	}
}
