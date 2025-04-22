"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";

function SignInContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [isRedirecting, setIsRedirecting] = useState(!error);

  useEffect(() => {
    if (!error && isRedirecting) {
      const timer = setTimeout(() => {
        signIn("poe", { callbackUrl: "/" });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [error, isRedirecting]);

  return (
    <div className="text-center p-8 bg-[#1a1a1a] rounded-lg shadow-lg">
      {error ? (
        <>
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-300 mb-4">
            There was a problem with the Path of Exile authorization. Please try
            again or contact support.
          </p>
          <div className="mt-6 space-x-4">
            <Link
              href="/"
              className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded"
            >
              Return Home
            </Link>
            <button
              onClick={() => {
                setIsRedirecting(true);
              }}
              className="px-4 py-2 bg-[#922729] hover:bg-[#922729]/90 text-white rounded"
            >
              Try Again
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-white mb-4">
            Redirecting to Path of Exile login...
          </h1>
          <p className="text-gray-400">
            You will be redirected automatically. If not, click the button
            below.
          </p>
          <button
            onClick={() => signIn("poe", { callbackUrl: "/" })}
            className="mt-4 px-4 py-2 bg-[#922729] hover:bg-[#922729]/90 text-white rounded"
          >
            Sign in with Path of Exile
          </button>
        </>
      )}
    </div>
  );
}

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <Suspense
        fallback={
          <div className="text-center p-8 bg-[#1a1a1a] rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-white mb-4">Loading...</h1>
          </div>
        }
      >
        <SignInContent />
      </Suspense>
    </div>
  );
}
