"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ReAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  allowContinueAsGuest?: boolean;
}

export function ReAuthDialog({
  open,
  onOpenChange,
  title = "Session Expired",
  description = "Your Path of Exile session has expired. This can happen after extended periods of inactivity or if PoE's authentication service requires re-validation.",
  allowContinueAsGuest = true,
}: ReAuthDialogProps) {
  const router = useRouter();

  const handleSignIn = () => {
    onOpenChange(false);
    signIn("poe");
  };

  const handleContinueAsGuest = () => {
    onOpenChange(false);
    router.push("/");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-900/20 rounded-full">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <DialogTitle className="text-white">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-zinc-400">
            Please sign in again to continue syncing your filters with Path of
            Exile. Your local work is saved and will be available after signing
            in.
          </p>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSignIn}
              className="w-full bg-[#922729] hover:bg-[#7a1f21] text-white"
            >
              Sign In with Path of Exile
            </Button>

            {allowContinueAsGuest && (
              <Button
                variant="outline"
                onClick={handleContinueAsGuest}
                className="w-full bg-[#2a2a2a] border-[#3a3a3a] text-zinc-300 hover:text-white hover:bg-[#3a3a3a]"
              >
                Continue as Guest
              </Button>
            )}
          </div>

          <div className="text-xs text-zinc-500 bg-[#2a2a2a] rounded p-3 border border-[#3a3a3a]">
            <p className="font-medium text-zinc-400 mb-1">Why does this happen?</p>
            <p>
              Path of Exile OAuth tokens expire for security. This is normal and
              happens with all applications using PoE authentication.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
