"use client";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
        <p className="text-gray-500 font-medium">Loading panel data...</p>
      </div>
    </div>
  );
}
