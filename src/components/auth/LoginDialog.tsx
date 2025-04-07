"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import PoEIcon from "@/components/icons/PoEIcon";

export default function LoginDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogin = (provider: string) => {
    signIn(provider);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="p-2 text-zinc-400 hover:text-white rounded bg-[#0e0e0e] hover:bg-[#0e0e0e] flex items-center"
          aria-label="Login"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
          </svg>
          <span className="hidden sm:inline">Login</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#121212] border-zinc-800 text-white max-w-sm p-6">
        <div className="absolute right-4 top-4">
          <button
            onClick={() => setIsOpen(false)}
            className="text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl text-center">
            Choose Login Method
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Button
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3"
            onClick={() => handleLogin("discord")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="mr-3"
            >
              <path d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.444.864-.608 1.249-1.844-.276-3.68-.276-5.486 0-.164-.393-.405-.874-.617-1.249a.077.077 0 00-.079-.037c-1.625.285-3.21.78-4.885 1.515a.07.07 0 00-.032.027C.533 9.045-.32 13.579.099 18.057a.082.082 0 00.031.056c2.052 1.507 4.041 2.422 5.992 3.029a.077.077 0 00.084-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 00-.041-.105c-.652-.247-1.27-.549-1.872-.892a.077.077 0 01-.008-.127c.125-.094.25-.192.371-.291a.074.074 0 01.077-.01c3.927 1.793 8.18 1.793 12.061 0a.073.073 0 01.078.009c.121.099.246.198.371.291a.077.077 0 01-.006.127 12.509 12.509 0 01-1.873.891.076.076 0 00-.04.106c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028c1.961-.607 3.95-1.522 6.002-3.029a.077.077 0 00.031-.055c.5-5.177-.838-9.673-3.549-13.661a.061.061 0 00-.031-.028zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.095 2.156 2.418 0 1.334-.955 2.419-2.156 2.419zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.095 2.156 2.418 0 1.334-.946 2.419-2.156 2.419Z" />
            </svg>
            Login with Discord
          </Button>
          <Button
            className="bg-[#922729] hover:bg-[#7D2123] text-white font-semibold py-3"
            onClick={() => handleLogin("poe")}
          >
            <PoEIcon className="w-5 h-5 mr-3" />
            Login with Path of Exile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
