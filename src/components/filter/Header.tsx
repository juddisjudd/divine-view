"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import AuthButton from "@/components/auth/AuthButton";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Editor", href: "/", icon: "code" },
  { name: "Community Filters", href: "/community", icon: "file" },
  { name: "Resources", href: "/resources", icon: "book" },
  {
    name: "Discord",
    href: "https://discord.divineview.app",
    icon: "message-circle",
  },
];

export default function Header() {
  const pathname = usePathname();

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "code":
        return (
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
            className="mr-1"
          >
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        );
      case "file":
        return (
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
            className="mr-1"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        );
      case "book":
        return (
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
            className="mr-1"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        );
      case "message-circle":
        return (
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
            className="mr-1"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-[#000000] border-b border-[#2a2a2a] relative z-40">
      <div className="flex items-center justify-between px-4 py-2">
        <Link href="/" className="flex items-center space-x-1">
          <Image
            src="/images/divine-view-icon.png"
            alt="Divine View"
            width={42}
            height={42}
            className="rounded-full"
          />
          <div>
            <h1 className="text-white text-lg font-medium">Divine View</h1>
            <h2 className="text-zinc-400 text-xs">PoE2 Loot Filter Editor</h2>
          </div>
        </Link>

        <nav className="absolute left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-3 py-1 text-sm font-medium transition-colors rounded-md flex items-center",
                    isActive
                      ? "text-white bg-[#2a2a2a]"
                      : "text-zinc-400 hover:text-white hover:bg-[#2a2a2a]"
                  )}
                >
                  {renderIcon(item.icon)}
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="relative z-50">
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
