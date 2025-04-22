"use client";
import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function SignIn() {
  useEffect(() => {
    signIn("poe", { callbackUrl: "/" });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <div className="text-center p-8 bg-[#1a1a1a] rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-4">
          Redirecting to Path of Exile login...
        </h1>
        <p className="text-gray-400">
          You will be redirected automatically. If not, click the button below.
        </p>
        <button
          onClick={() => signIn("poe", { callbackUrl: "/" })}
          className="mt-4 px-4 py-2 bg-[#922729] hover:bg-[#922729]/90 text-white rounded"
        >
          Sign in with Path of Exile
        </button>
      </div>
    </div>
  );
}
