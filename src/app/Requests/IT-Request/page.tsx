"use client";

import type React from "react";

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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Monitor, Laptop } from "lucide-react";
import { useRouter } from "next/navigation";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate a unique request ID
    const requestId = `REQ-${Date.now()}`;
    const submissionData = {
      ...formData,
      requestId,
      submittedDate: new Date().toISOString(),
    };

    // Store in localStorage (in production, this would be saved to a database)
    localStorage.setItem("currentRequest", JSON.stringify(submissionData));

    // Redirect to preview page
    router.push("/request-preview");
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
                      required
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
                      required
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
                      required
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
                      required
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
                  <h4 className="font-medium text-gray-800">Software:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* MES Card */}
                    <Card
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.softwareMES
                          ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
                          : "hover:border-gray-300"
                      }`}
                      onClick={() =>
                        handleInputChange("softwareMES", !formData.softwareMES)
                      }
                    >
                      <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-16 h-16 mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img
                            src="/placeholder.svg?height=64&width=64"
                            alt="MES Software"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h5
                          className={`font-semibold text-sm mb-1 ${
                            formData.softwareMES
                              ? "text-blue-900"
                              : "text-gray-700"
                          }`}
                        >
                          MES
                        </h5>
                        <p
                          className={`text-xs ${
                            formData.softwareMES
                              ? "text-blue-700"
                              : "text-gray-500"
                          }`}
                        >
                          Manufacturing Execution System
                        </p>
                        {formData.softwareMES && (
                          <div className="mt-2 flex items-center text-blue-600">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1"></div>
                            <span className="text-xs font-medium">
                              Selected
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Office 365 Card */}
                    <Card
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.softwareOffice365
                          ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
                          : "hover:border-gray-300"
                      }`}
                      onClick={() =>
                        handleInputChange(
                          "softwareOffice365",
                          !formData.softwareOffice365
                        )
                      }
                    >
                      <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-16 h-16 mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img
                            src="/placeholder.svg?height=64&width=64"
                            alt="Office 365"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h5
                          className={`font-semibold text-sm mb-1 ${
                            formData.softwareOffice365
                              ? "text-blue-900"
                              : "text-gray-700"
                          }`}
                        >
                          Office 365
                        </h5>
                        <p
                          className={`text-xs ${
                            formData.softwareOffice365
                              ? "text-blue-700"
                              : "text-gray-500"
                          }`}
                        >
                          Microsoft Office Suite
                        </p>
                        {formData.softwareOffice365 && (
                          <div className="mt-2 flex items-center text-blue-600">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1"></div>
                            <span className="text-xs font-medium">
                              Selected
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* EPICOR Card */}
                    <Card
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.softwareEPICOR
                          ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
                          : "hover:border-gray-300"
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
                          <img
                            src="/placeholder.svg?height=64&width=64"
                            alt="EPICOR Software"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h5
                          className={`font-semibold text-sm mb-1 ${
                            formData.softwareEPICOR
                              ? "text-blue-900"
                              : "text-gray-700"
                          }`}
                        >
                          EPICOR
                        </h5>
                        <p
                          className={`text-xs ${
                            formData.softwareEPICOR
                              ? "text-blue-700"
                              : "text-gray-500"
                          }`}
                        >
                          Enterprise Resource Planning
                        </p>
                        {formData.softwareEPICOR && (
                          <div className="mt-2 flex items-center text-blue-600">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1"></div>
                            <span className="text-xs font-medium">
                              Selected
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Other Software Card */}
                    <Card
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.softwareOther
                          ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
                          : "hover:border-gray-300"
                      }`}
                      onClick={() => {
                        if (!formData.softwareOther) {
                          setTimeout(() => {
                            const input = document.getElementById(
                              "softwareOtherInput"
                            ) as HTMLInputElement;
                            if (input) input.focus();
                          }, 100);
                        }
                      }}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-16 h-16 mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img
                            src="/placeholder.svg?height=64&width=64"
                            alt="Other Software"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h5
                          className={`font-semibold text-sm mb-1 ${
                            formData.softwareOther
                              ? "text-blue-900"
                              : "text-gray-700"
                          }`}
                        >
                          Other
                        </h5>
                        <p
                          className={`text-xs ${
                            formData.softwareOther
                              ? "text-blue-700"
                              : "text-gray-500"
                          }`}
                        >
                          Specify other software
                        </p>
                        {formData.softwareOther && (
                          <div className="mt-2 flex items-center text-blue-600">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1"></div>
                            <span className="text-xs font-medium">
                              Selected
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {formData.softwareOther && (
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="softwareOtherInput">
                        Specify Other Software:
                      </Label>
                      <Input
                        id="softwareOtherInput"
                        value={formData.softwareOther}
                        onChange={(e) =>
                          handleInputChange("softwareOther", e.target.value)
                        }
                        placeholder="Enter the name of other software needed"
                        className="max-w-md"
                      />
                    </div>
                  )}

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
                  <h4 className="font-medium text-gray-800">Hardware:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* PC Card */}
                    <Card
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.hardwareSelection === "pc"
                          ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
                          : "hover:border-gray-300"
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
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        />
                        <h5
                          className={`font-semibold text-lg mb-2 ${
                            formData.hardwareSelection === "pc"
                              ? "text-blue-900"
                              : "text-gray-700"
                          }`}
                        >
                          PC & Peripherals
                        </h5>
                        <p
                          className={`text-sm ${
                            formData.hardwareSelection === "pc"
                              ? "text-blue-700"
                              : "text-gray-500"
                          }`}
                        >
                          Desktop computer with monitor, keyboard, and mouse
                        </p>
                        {formData.hardwareSelection === "pc" && (
                          <div className="mt-3 flex items-center text-blue-600">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
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
                          ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
                          : "hover:border-gray-300"
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
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        />
                        <h5
                          className={`font-semibold text-lg mb-2 ${
                            formData.hardwareSelection === "laptop"
                              ? "text-blue-900"
                              : "text-gray-700"
                          }`}
                        >
                          Laptop
                        </h5>
                        <p
                          className={`text-sm ${
                            formData.hardwareSelection === "laptop"
                              ? "text-blue-700"
                              : "text-gray-500"
                          }`}
                        >
                          Portable laptop computer for mobile work
                        </p>
                        {formData.hardwareSelection === "laptop" && (
                          <div className="mt-3 flex items-center text-blue-600">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
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
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button type="submit" className="flex-1">
                  Submit IT Request
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
                  Save as Draft
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
