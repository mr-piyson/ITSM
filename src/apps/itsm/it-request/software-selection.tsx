"use client";

import Image from "next/image";

import MESLogo from "@/assets/icons/MESLogo";
import epicor from "@/assets/images/epicor.jpg";
import office365 from "@/assets/images/office.webp";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { RequestFormData, RequestFormField } from "./request-schema";

interface SoftwareSelectionProps {
	value: RequestFormData;
	onChange: (field: RequestFormField, value: string | boolean) => void;
}

const selectableCardClassName = (selected: boolean) =>
	`cursor-pointer transition-all duration-200 hover:shadow-md max-sm:p-0 ${
		selected ? "ring-2 ring-primary bg-primary/15 " : "hover:border-border"
	}`;

export function SoftwareSelection(props: SoftwareSelectionProps) {
	const { value: formData, onChange } = props;

	return (
		<div className="space-y-4">
			<h4 className="font-medium text-primary">Software:</h4>
			<div className="grid max-sm:grid-cols-1 grid-cols-3 gap-3">
				<Card
					className={selectableCardClassName(formData.softwareMES)}
					onClick={() => onChange("softwareMES", !formData.softwareMES)}
				>
					<CardContent className="flex flex-col items-center justify-center p-4 text-center ">
						<div className="w-16 h-16 mb-3 rounded-lg overflow-hidden  flex items-center justify-center">
							<MESLogo />
						</div>
						<h5
							className={`font-semibold text-sm mb-1 ${
								formData.softwareMES ? "text-primary" : "text-foreground"
							}`}
						>
							MES
						</h5>
						<p
							className={`text-xs ${
								formData.softwareMES ? "text-muted-foreground" : "text-gray-500"
							}`}
						>
							Manufacturing Execution System
						</p>
						{formData.softwareMES && (
							<div className="mt-2 flex items-center text-prbg-primary">
								<div className="w-1.5 h-1.5 bg-primary rounded-full mr-1"></div>
								<span className="text-xs font-medium">Selected</span>
							</div>
						)}
					</CardContent>
				</Card>

				<Card
					className={selectableCardClassName(formData.softwareOffice365)}
					onClick={() =>
						onChange("softwareOffice365", !formData.softwareOffice365)
					}
				>
					<CardContent className="flex flex-col items-center justify-center p-4 text-center">
						<div className="w-16 h-16 mb-3 rounded-lg overflow-hidden  flex items-center justify-center">
							<Image
								src={office365}
								width={100}
								height={100}
								alt="MES Software"
								className="w-full h-full object-contain"
							/>
						</div>
						<h5
							className={`font-semibold text-sm mb-1 ${
								formData.softwareOffice365 ? "text-primary" : "text-foreground"
							}`}
						>
							Office 365
						</h5>
						<p
							className={`text-xs ${
								formData.softwareOffice365 ? "text-primary" : "text-gray-500"
							}`}
						>
							Microsoft Office Suite
						</p>
						{formData.softwareOffice365 && (
							<div className="mt-2 flex items-center text-prbg-primary">
								<div className="w-1.5 h-1.5 bg-primary rounded-full mr-1"></div>
								<span className="text-xs font-medium">Selected</span>
							</div>
						)}
					</CardContent>
				</Card>

				<Card
					className={selectableCardClassName(formData.softwareEPICOR)}
					onClick={() => onChange("softwareEPICOR", !formData.softwareEPICOR)}
				>
					<CardContent className="flex flex-col items-center justify-center p-4 text-center">
						<div className="w-16 h-16 mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
							<Image
								src={epicor}
								width={100}
								height={100}
								alt="MES Software"
								className="w-full h-full object-cover"
							/>
						</div>
						<h5
							className={`font-semibold text-sm mb-1 ${
								formData.softwareEPICOR ? "text-primary" : "text-foreground"
							}`}
						>
							EPICOR
						</h5>
						<p
							className={`text-xs ${
								formData.softwareEPICOR
									? "text-muted-foreground"
									: "text-muted-foreground"
							}`}
						>
							Enterprise Resource Planning
						</p>
						{formData.softwareEPICOR && (
							<div className="mt-2 flex items-center ">
								<div className="w-1.5 h-1.5 bg-primary rounded-full mr-1"></div>
								<span className="text-xs font-medium">Selected</span>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<div className="space-y-2">
				<Label htmlFor="similarPermissions">Similar permissions to:</Label>
				<Input
					id="similarPermissions"
					value={formData.similarPermissions}
					onChange={(e) => onChange("similarPermissions", e.target.value)}
					placeholder="Enter user with similar permissions"
				/>
			</div>
		</div>
	);
}
