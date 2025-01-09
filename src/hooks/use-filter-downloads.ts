import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function useFilterDownloads() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const downloadFilter = useCallback(
    async (filterId: string, filterName: string) => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/filters/${filterId}/download`, {
          method: "POST",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to download filter");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filterName}.filter`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        return true;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to download filter";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    downloadFilter,
  };
}
