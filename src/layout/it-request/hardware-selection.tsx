"use client";

import { Laptop, Monitor } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { RequestFormData, RequestFormField } from "./request-schema";

interface HardwareSelectionProps {
	value: RequestFormData;
	onChange: (field: RequestFormField, value: string | boolean) => void;
}

const hardwareCardClassName = (selected: boolean) =>
	`cursor-pointer transition-all duration-200 hover:shadow-md ${
		selected
			? "ring-2 ring-primary bg-primary/15 "
			: "hover:border-muted-foreground"
	}`;

export function HardwareSelection(props: HardwareSelectionProps) {
	const { value: formData, onChange } = props;
	const selected = (key: string) => formData.hardwareSelection === key;

	return (
		<div className="space-y-4">
			<h4 className="font-medium text-primary">Hardware:</h4>
			<div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
				<Card
					className={hardwareCardClassName(selected("pc"))}
					onClick={() =>
						onChange("hardwareSelection", selected("pc") ? "" : "pc")
					}
				>
					<CardContent className="flex flex-col items-center justify-center p-6 text-center">
						<Monitor
							className={`w-12 h-12 mb-3 ${
								selected("pc") ? "text-primary" : "text-muted-foreground"
							}`}
						/>
						<h5
							className={`font-semibold text-lg mb-2 ${
								selected("pc") ? "text-foreground" : "text-muted-foreground"
							}`}
						>
							PC
						</h5>
						<p className={"text-sm text-muted-foreground"}>
							Desktop computer with monitor, keyboard, and mouse
						</p>

						{selected("pc") && (
							<div className="mt-3 flex items-center text-primary">
								<div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
								<span className="text-sm font-medium">Selected</span>
							</div>
						)}
					</CardContent>
				</Card>

				<Card
					className={hardwareCardClassName(selected("laptop"))}
					onClick={() =>
						onChange("hardwareSelection", selected("laptop") ? "" : "laptop")
					}
				>
					<CardContent className="flex flex-col items-center justify-center p-6 text-center">
						<Laptop
							className={`w-12 h-12 mb-3 ${
								selected("laptop") ? "text-primary" : "text-muted-foreground"
							}`}
						/>
						<h5
							className={`font-semibold text-lg mb-2 ${
								selected("laptop") ? "text-foreground" : "text-muted-foreground"
							}`}
						>
							laptop
						</h5>
						<p
							className={`text-sm ${
								selected("laptop") ? "text-muted-foreground" : "text-gray-500"
							}`}
						>
							Portable laptop computer for mobile work
						</p>
						{selected("laptop") && (
							<div className="mt-3 flex items-center text-primary">
								<div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
								<span className="text-sm font-medium">Selected</span>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
			<div className="space-y-2">
				<Label htmlFor="hardwareOther">Other Hardware:</Label>
				<Input
					id="hardwareOther"
					value={formData.hardwareOther}
					onChange={(e) => onChange("hardwareOther", e.target.value)}
					placeholder="Specify other hardware needed"
				/>
			</div>
		</div>
	);
}
