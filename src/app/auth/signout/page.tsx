"use client";
import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function SignOut() {
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <div className="text-center p-8 bg-[#1a1a1a] rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-4">
          Signing you out...
        </h1>
        <p className="text-gray-400">You will be redirected automatically.</p>
      </div>
    </div>
  );
}
