"use client";

import { Laptop, Monitor } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import MESLogo from "@/assets/icons/MESLogo";
import epicor from "@/assets/images/epicor.jpg";
import office365 from "@/assets/images/office.webp";
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

export default function ITRequestForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    requesterName: "",
    requesterManager: "",
    department: "",
    location: "",
    softwareMES: false,
    softwareOffice365: false,
    softwareEPICOR: false,
    softwareOther: "",
    similarPermissions: "",
    hardwareSelection: "",
    hardwareOther: "",
    sharedFilesAccess: "",
    othersSpecify: "",
    justification: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
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

                {/* Software Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-primary">Software:</h4>
                  <div className="grid max-sm:grid-cols-1 grid-cols-3 gap-3">
                    {/* MES Card */}
                    <Card
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md max-sm:p-0 ${
                        formData.softwareMES
                          ? "ring-2 ring-primary bg-primary/15 "
                          : "hover:border-border"
                      }`}
                      onClick={() =>
                        handleInputChange("softwareMES", !formData.softwareMES)
                      }
                    >
                      <CardContent className="flex flex-col items-center justify-center p-4 text-center ">
                        <div className="w-16 h-16 mb-3 rounded-lg overflow-hidden  flex items-center justify-center">
                          <MESLogo />
                        </div>
                        <h5
                          className={`font-semibold text-sm mb-1 ${
                            formData.softwareMES
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          MES
                        </h5>
                        <p
                          className={`text-xs ${
                            formData.softwareMES
                              ? "text-muted-foreground"
                              : "text-gray-500"
                          }`}
                        >
                          Manufacturing Execution System
                        </p>
                        {formData.softwareMES && (
                          <div className="mt-2 flex items-center text-prbg-primary">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-1"></div>
                            <span className="text-xs font-medium">
                              Selected
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Office 365 Card */}
                    <Card
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md max-sm:p-0 ${
                        formData.softwareOffice365
                          ? "ring-2 ring-primary bg-primary/15 "
                          : "hover:border-border"
                      }`}
                      onClick={() =>
                        handleInputChange(
                          "softwareOffice365",
                          !formData.softwareOffice365
                        )
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
                            formData.softwareOffice365
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          Office 365
                        </h5>
                        <p
                          className={`text-xs ${
                            formData.softwareOffice365
                              ? "text-primary"
                              : "text-gray-500"
                          }`}
                        >
                          Microsoft Office Suite
                        </p>
                        {formData.softwareOffice365 && (
                          <div className="mt-2 flex items-center text-prbg-primary">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-1"></div>
                            <span className="text-xs font-medium">
                              Selected
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* EPICOR Card */}
                    <Card
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md max-sm:p-0 ${
                        formData.softwareEPICOR
                          ? "ring-2 ring-primary bg-primary/15 "
                          : "hover:border-border"
                      }`}
                      onClick={() =>
                        handleInputChange(
                          "softwareEPICOR",
                          !formData.softwareEPICOR
                        )
                      }
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
                            formData.softwareEPICOR
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          EPICOR
                        </h5>
                        <p
                          className={`text-xs ${
                            formData.softwareEPICOR
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          Enterprise Resource Planning
                        </p>
                        {formData.softwareEPICOR && (
                          <div className="mt-2 flex items-center ">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-1"></div>
                            <span className="text-xs font-medium">
                              Selected
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="similarPermissions">
                      Similar permissions to:
                    </Label>
                    <Input
                      id="similarPermissions"
                      value={formData.similarPermissions}
                      onChange={(e) =>
                        handleInputChange("similarPermissions", e.target.value)
                      }
                      placeholder="Enter user with similar permissions"
                    />
                  </div>
                </div>

                {/* Hardware Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-primary">Hardware:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                    {/* PC Card */}
                    <Card
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.hardwareSelection === "pc"
                          ? "ring-2 ring-primary bg-primary/15 "
                          : "hover:border-muted-foreground"
                      }`}
                      onClick={() =>
                        handleInputChange(
                          "hardwareSelection",
                          formData.hardwareSelection === "pc" ? "" : "pc"
                        )
                      }
                    >
                      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <Monitor
                          className={`w-12 h-12 mb-3 ${
                            formData.hardwareSelection === "pc"
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                        <h5
                          className={`font-semibold text-lg mb-2 ${
                            formData.hardwareSelection === "pc"
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          PC
                        </h5>
                        <p className={"text-sm text-muted-foreground"}>
                          Desktop computer with monitor, keyboard, and mouse
                        </p>

                        {formData.hardwareSelection === "pc" && (
                          <div className="mt-3 flex items-center text-primary">
                            <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                            <span className="text-sm font-medium">
                              Selected
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Laptop Card */}
                    <Card
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.hardwareSelection === "laptop"
                          ? "ring-2 ring-primary bg-primary/15 "
                          : "hover:border-muted-foreground"
                      }`}
                      onClick={() =>
                        handleInputChange(
                          "hardwareSelection",
                          formData.hardwareSelection === "laptop"
                            ? ""
                            : "laptop"
                        )
                      }
                    >
                      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <Laptop
                          className={`w-12 h-12 mb-3 ${
                            formData.hardwareSelection === "laptop"
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                        <h5
                          className={`font-semibold text-lg mb-2 ${
                            formData.hardwareSelection === "laptop"
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          laptop
                        </h5>
                        <p
                          className={`text-sm ${
                            formData.hardwareSelection === "laptop"
                              ? "text-muted-foreground"
                              : "text-gray-500"
                          }`}
                        >
                          Portable laptop computer for mobile work
                        </p>
                        {formData.hardwareSelection === "laptop" && (
                          <div className="mt-3 flex items-center text-primary">
                            <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                            <span className="text-sm font-medium">
                              Selected
                            </span>
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
                      onChange={(e) =>
                        handleInputChange("hardwareOther", e.target.value)
                      }
                      placeholder="Specify other hardware needed"
                    />
                  </div>
                </div>

                {/* Additional Requirements */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sharedFilesAccess">
                      Shared Files Access:
                    </Label>
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
                    <Label htmlFor="othersSpecify">
                      Others (Please specify):
                    </Label>
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
                    Why this request? What's the current situation? What will
                    change after approval? *
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
      </div>
    </div>
  );
}
