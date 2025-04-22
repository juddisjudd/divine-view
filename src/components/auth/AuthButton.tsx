"use client";
import { useSession, signOut, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import PoEIcon from "@/components/icons/PoEIcon";

export default function AuthButton() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogin = () => {
    signIn("poe");
  };

  if (session?.user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center justify-center h-8 w-8 rounded-full overflow-hidden"
          aria-label="User menu"
        >
          <Image 
            src={session.user.image || "/images/default-avatar.png"}
            alt={session.user.name || "User avatar"}
            className="h-8 w-8 rounded-full"
            width={32}
            height={32}
          />
        </button>

        {showDropdown && (
          <div className={`absolute right-0 mt-2 w-48 bg-[#0e0e0e] border border-[#2a2a2a] shadow-lg rounded-md z-50 ${
            isMobile ? "right-0" : "right-0"
          }`}>
            <div className="py-2 px-4 border-b border-[#2a2a2a]">
              <p className="text-white font-medium truncate">
                {session.user.name || "User"}
              </p>
              {session.user.email && (
                <p className="text-zinc-400 text-xs truncate">
                  {session.user.email}
                </p>
              )}
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center w-full text-left px-4 py-3 text-zinc-400 hover:text-white hover:bg-[#202020]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button 
      onClick={handleLogin}
      className="p-2 text-zinc-400 hover:text-white rounded bg-[#0e0e0e] hover:bg-[#0e0e0e] flex items-center"
      aria-label="Login with Path of Exile"
    >
      <PoEIcon className="w-4 h-4 mr-2" />
      <span className="hidden sm:inline">Login with PoE</span>
    </Button>
  );
}