import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useDevToast = () => {
  const { toast } = useToast();

  useEffect(() => {
    console.log("Trying to show toast from hook");
    toast({
      title: "Development Mode",
      description: "This site is under active development, expect bugs!",
      variant: "destructive",
      duration: 5000,
    });
  }, []);
};