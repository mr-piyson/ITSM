"use client";

import type React from "react";
import { useState } from "react";

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		// const res = await createRequest({
		// 	department: formData.department,
		// 	location: formData.location,
		// 	software: JSON.stringify([
		// 		formData.softwareMES,
		// 		formData.softwareOffice365,
		// 		formData.softwareEPICOR,
		// 		formData.softwareOther,
		// 	]),
		// 	Permissions: formData.similarPermissions,
		// 	hardware: formData.hardwareSelection,
		// 	other: formData.hardwareOther,
		// 	sharedFilesAccess: formData.sharedFilesAccess,
		// 	justification: formData.justification,
		// 	requesterManager: formData.requesterManager,
		// 	requesterName: formData.requesterName,
		// 	createdAt: new Date(), // Add this line to include the createdAt property
		// });
		// if (res.status === 200) {
		// 	toast.success("Request submitted successfully!");
		// 	router.replace("/");
		// } else {
		// 	toast.error(res.error);
		// }
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
						<Button type="submit" className="flex-1">
							Submit IT Request
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
