"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";

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
          <div
            className={`absolute right-0 mt-2 w-48 bg-[#0e0e0e] border border-[#2a2a2a] shadow-lg rounded-md z-50 ${
              isMobile ? "right-0" : "right-0"
            }`}
          >
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
      className="p-2 text-zinc-400 hover:text-white rounded bg-[#0e0e0e] hover:bg-[#0e0e0e] flex items-center"
      onClick={() => signIn("discord")}
      aria-label="Login with Discord"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 mr-2"
      >
        <path d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.444.864-.608 1.249-1.844-.276-3.68-.276-5.486 0-.164-.393-.405-.874-.617-1.249a.077.077 0 00-.079-.037c-1.625.285-3.21.78-4.885 1.515a.07.07 0 00-.032.027C.533 9.045-.32 13.579.099 18.057a.082.082 0 00.031.056c2.052 1.507 4.041 2.422 5.992 3.029a.077.077 0 00.084-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 00-.041-.105c-.652-.247-1.27-.549-1.872-.892a.077.077 0 01-.008-.127c.125-.094.25-.192.371-.291a.074.074 0 01.077-.01c3.927 1.793 8.18 1.793 12.061 0a.073.073 0 01.078.009c.121.099.246.198.371.291a.077.077 0 01-.006.127 12.509 12.509 0 01-1.873.891.076.076 0 00-.04.106c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028c1.961-.607 3.95-1.522 6.002-3.029a.077.077 0 00.031-.055c.5-5.177-.838-9.673-3.549-13.661a.061.061 0 00-.031-.028zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.095 2.156 2.418 0 1.334-.955 2.419-2.156 2.419zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.095 2.156 2.418 0 1.334-.946 2.419-2.156 2.419Z" />
      </svg>

      {/* Only show text on larger screens */}
      <span className="hidden sm:inline">Login with Discord</span>
    </Button>
  );
}
