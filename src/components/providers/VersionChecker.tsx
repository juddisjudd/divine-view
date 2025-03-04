"use client";

import { useEffect } from "react";
import { SITE_VERSION } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export function VersionChecker() {
  const { toast } = useToast();

  useEffect(() => {
    const storedVersion = localStorage.getItem("site-version");

    if (!storedVersion || storedVersion !== SITE_VERSION) {
      localStorage.setItem("site-version", SITE_VERSION);

      if (storedVersion) {
        toast({
          title: "Application Updated",
          description: `The site has been updated to version ${SITE_VERSION}. Refresh the page to ensure you have the latest features.`,
          action: (
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          ),
          duration: 10000,
        });
      }
    }
  }, [toast]);

  return null;
}
