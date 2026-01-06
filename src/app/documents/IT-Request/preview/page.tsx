"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Printer, ArrowLeft, Check } from "lucide-react";

interface RequestData {
  requestId: string;
  submittedDate: string;
  requesterName: string;
  requesterManager: string;
  department: string;
  location: string;
  softwareMES: boolean;
  softwareOffice365: boolean;
  softwareEPICOR: boolean;
  softwareOther: string;
  similarPermissions: string;
  hardwareSelection: string;
  hardwareOther: string;
  sharedFilesAccess: string;
  othersSpecify: string;
  justification: string;
}

export default function RequestPreview() {
  const router = useRouter();
  const [requestData, setRequestData] = useState<RequestData | null>(null);

  useEffect(() => {
    // Retrieve data from localStorage
    const data = localStorage.getItem("currentRequest");
    if (data) {
      setRequestData(JSON.parse(data));
    } else {
      router.push("/");
    }
  }, [router]);

  const handlePrint = () => {
    window.print();
  };

  if (!requestData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      {/* Print controls - hidden when printing */}
      <div className="no-print bg-gray-100 py-4 px-4 border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Form
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Request
          </Button>
        </div>
      </div>

      {/* A4 Page */}
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="a4-page mx-auto bg-white shadow-lg">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              IT REQUEST FORM
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Request ID: {requestData.requestId}
            </p>
            <p className="text-xs text-gray-500">
              Submitted: {formatDate(requestData.submittedDate)}
            </p>
          </div>

          {/* Requester Information */}
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-400 pb-1 mb-3">
              Requester Information:
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Requester Name / ID:</span>
                <div className="border-b border-gray-300 mt-1 pb-1">
                  {requestData.requesterName}
                </div>
              </div>
              <div>
                <span className="font-semibold">Requester's Manager / ID:</span>
                <div className="border-b border-gray-300 mt-1 pb-1">
                  {requestData.requesterManager}
                </div>
              </div>
              <div>
                <span className="font-semibold">Department:</span>
                <div className="border-b border-gray-300 mt-1 pb-1">
                  {requestData.department}
                </div>
              </div>
              <div>
                <span className="font-semibold">Location:</span>
                <div className="border-b border-gray-300 mt-1 pb-1">
                  {requestData.location}
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-400 pb-1 mb-3">
              Requirements:
            </h2>

            {/* Software */}
            <div className="mb-4">
              <p className="font-semibold text-sm mb-2">Software:</p>
              <div className="flex flex-wrap gap-2 text-sm ml-4">
                {requestData.softwareMES && (
                  <span className="flex items-center">
                    <Check className="w-3 h-3 mr-1" /> MES
                  </span>
                )}
                {requestData.softwareOffice365 && (
                  <span className="flex items-center">
                    <Check className="w-3 h-3 mr-1" /> Office 365
                  </span>
                )}
                {requestData.softwareEPICOR && (
                  <span className="flex items-center">
                    <Check className="w-3 h-3 mr-1" /> EPICOR
                  </span>
                )}
                {requestData.softwareOther && (
                  <span className="flex items-center">
                    <Check className="w-3 h-3 mr-1" /> Other:{" "}
                    {requestData.softwareOther}
                  </span>
                )}
              </div>
              {requestData.similarPermissions && (
                <div className="text-sm mt-2 ml-4">
                  <span className="font-semibold">Similar permissions to:</span>{" "}
                  {requestData.similarPermissions}
                </div>
              )}
            </div>

            {/* Hardware */}
            <div className="mb-4">
              <p className="font-semibold text-sm mb-2">Hardware:</p>
              <div className="text-sm ml-4">
                {requestData.hardwareSelection === "pc" && (
                  <span className="flex items-center">
                    <Check className="w-3 h-3 mr-1" /> PC & Peripherals
                  </span>
                )}
                {requestData.hardwareSelection === "laptop" && (
                  <span className="flex items-center">
                    <Check className="w-3 h-3 mr-1" /> Laptop
                  </span>
                )}
                {requestData.hardwareOther && (
                  <div className="mt-1">
                    <span className="font-semibold">Other:</span>{" "}
                    {requestData.hardwareOther}
                  </div>
                )}
              </div>
            </div>

            {/* Shared Files */}
            {requestData.sharedFilesAccess && (
              <div className="mb-4">
                <p className="font-semibold text-sm mb-1">
                  Shared Files Access:
                </p>
                <div className="text-sm ml-4 border-b border-gray-300 pb-1">
                  {requestData.sharedFilesAccess}
                </div>
              </div>
            )}

            {/* Others */}
            {requestData.othersSpecify && (
              <div className="mb-4">
                <p className="font-semibold text-sm mb-1">
                  Others (Please specify):
                </p>
                <div className="text-sm ml-4 border-b border-gray-300 pb-1">
                  {requestData.othersSpecify}
                </div>
              </div>
            )}
          </div>

          {/* Justification */}
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-400 pb-1 mb-3">
              Justification:
            </h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {requestData.justification}
            </p>
          </div>

          {/* Approvals Section */}
          <div className="border-t-2 border-gray-800 pt-4 mt-8">
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Approvals:
            </h2>

            {/* IT Department */}
            <div className="mb-6">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">IT Department:</p>
                  <div className="border-b border-gray-400 pb-1 min-h-[24px]"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">Signature:</p>
                  <div className="border-b border-gray-400 pb-1 min-h-[24px]"></div>
                </div>
                <div className="w-32">
                  <p className="text-sm font-semibold mb-1">Date:</p>
                  <div className="border-b border-gray-400 pb-1 min-h-[24px]"></div>
                </div>
              </div>
            </div>

            {/* Review */}
            <div className="mb-6">
              <p className="text-sm font-semibold mb-1">Review (If any):</p>
              <div className="border border-gray-300 min-h-[80px] p-2 rounded"></div>
            </div>

            {/* Finance Department */}
            <div className="mb-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">
                    Finance Department:
                  </p>
                  <div className="border-b border-gray-400 pb-1 min-h-[24px]"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">Signature:</p>
                  <div className="border-b border-gray-400 pb-1 min-h-[24px]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          .no-print {
            display: none !important;
          }

          .a4-page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 0;
            box-shadow: none;
            page-break-after: always;
          }
        }

        @media screen {
          .a4-page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 0 auto;
          }
        }
      `}</style>
    </>
  );
}
