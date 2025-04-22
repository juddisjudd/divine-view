"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Error() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <div className="text-center p-8 bg-[#1a1a1a] rounded-lg shadow-lg max-w-md">
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          Authentication Error
        </h1>
        <p className="text-gray-300 mb-4">
          {error === "OAuthCallbackError"
            ? "There was a problem with the Path of Exile authorization process. This could be due to an invalid configuration or callback URL."
            : `Error: ${error || "Unknown authentication error"}`}
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded mr-4"
          >
            Return Home
          </Link>
          <button
            onClick={() => (window.location.href = "/auth/signin")}
            className="px-4 py-2 bg-[#922729] hover:bg-[#922729]/90 text-white rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
