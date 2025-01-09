"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButton from "@/components/auth/AuthButton";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Editor", href: "/" },
  { name: "Community Filters", href: "/community" },
  { name: "Resources", href: "/resources" },
  { name: "Discord", href: "https://discord.divineview.app" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-[#030303] border-b border-[#2a2a2a]">
      <div className="flex flex-col px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <Link href="/">
                <h1 className="text-white text-lg font-medium">Divine View</h1>
              </Link>
              <h2 className="text-zinc-400 text-sm">PoE2 Loot Filter Editor</h2>
            </div>
            <nav className="flex space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-3 py-1 text-sm font-medium transition-colors rounded-md",
                      isActive
                        ? "text-white bg-[#2a2a2a]"
                        : "text-zinc-400 hover:text-white hover:bg-[#2a2a2a]"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
