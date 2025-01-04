import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useDevToast = () => {
  const { toast } = useToast();

  useEffect(() => {
    console.log("Trying to show toast from hook");
    toast({
      title: "Test Toast",
      description: "This is a test toast notification",
      variant: "default",
      duration: 5000,
    });
  }, [toast]);
};
