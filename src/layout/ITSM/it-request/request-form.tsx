"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { HardwareSelection } from "./hardware-selection";
import {
	emptyRequestForm,
	type RequestFormData,
	type RequestFormField,
} from "./request-schema";
import { SoftwareSelection } from "./software-selection";

export function RequestForm() {
	const [formData, setFormData] = useState<RequestFormData>(emptyRequestForm);
	const [submitting, setSubmitting] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (submitting) {
			return;
		}
		setSubmitting(true);
		try {
			const res = await fetch("/api/it-request", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});
			if (res.ok) {
				toast.success("Request submitted successfully!");
				setFormData(emptyRequestForm);
				router.replace("/");
			} else {
				const payload = (await res.json().catch(() => null)) as {
					error?: string;
				} | null;
				toast.error(payload?.error ?? "Failed to submit request");
			}
		} catch {
			toast.error("Failed to submit request");
		} finally {
			setSubmitting(false);
		}
	};

	const handleInputChange = (
		field: RequestFormField,
		value: string | boolean,
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle className="text-2xl font-bold text-primary">
					IT REQUEST FORM
				</CardTitle>
				<CardDescription>
					Please fill out all required fields to submit your IT request
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-8">
					{/* Requester Information */}
					<div className="space-y-6">
						<h3 className="text-lg font-semibold text-primary border-b pb-2">
							Requester Information
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="requesterName">Requester Name / ID *</Label>
								<Input
									id="requesterName"
									value={formData.requesterName}
									onChange={(e) =>
										handleInputChange("requesterName", e.target.value)
									}
									placeholder="Enter your name and ID"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="requesterManager">
									Requester's Manager / ID *
								</Label>
								<Input
									id="requesterManager"
									value={formData.requesterManager}
									onChange={(e) =>
										handleInputChange("requesterManager", e.target.value)
									}
									placeholder="Enter manager's name and ID"
								/>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="department">Department *</Label>
								<Input
									id="department"
									value={formData.department}
									onChange={(e) =>
										handleInputChange("department", e.target.value)
									}
									placeholder="Enter your department"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="location">Location *</Label>
								<Input
									id="location"
									value={formData.location}
									onChange={(e) =>
										handleInputChange("location", e.target.value)
									}
									placeholder="Enter your location"
								/>
							</div>
						</div>
					</div>

					<Separator />

					{/* Requirements */}
					<div className="space-y-6">
						<h3 className="text-lg font-semibold text-primary border-b pb-2">
							Requirements
						</h3>

						<SoftwareSelection value={formData} onChange={handleInputChange} />

						<HardwareSelection value={formData} onChange={handleInputChange} />

						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="sharedFilesAccess">Shared Files Access:</Label>
								<Input
									id="sharedFilesAccess"
									value={formData.sharedFilesAccess}
									onChange={(e) =>
										handleInputChange("sharedFilesAccess", e.target.value)
									}
									placeholder="Specify shared files or folders needed"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="othersSpecify">Others (Please specify):</Label>
								<Input
									id="othersSpecify"
									value={formData.othersSpecify}
									onChange={(e) =>
										handleInputChange("othersSpecify", e.target.value)
									}
									placeholder="Any other requirements"
								/>
							</div>
						</div>
					</div>

					<Separator />

					{/* Justification */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-primary border-b pb-2">
							Justification
						</h3>
						<div className="space-y-2">
							<Label htmlFor="justification">
								Why this request? What's the current situation? What will change
								after approval? *
							</Label>
							<Textarea
								id="justification"
								value={formData.justification}
								onChange={(e) =>
									handleInputChange("justification", e.target.value)
								}
								placeholder="Please provide detailed justification for this request..."
								className="min-h-[120px]"
							/>
						</div>
					</div>

					<Separator />

					{/* Submit Button */}
					<div className="flex flex-col sm:flex-row gap-4 pt-6">
						<Button type="submit" className="flex-1" disabled={submitting}>
							{submitting ? "Submitting…" : "Submit IT Request"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
