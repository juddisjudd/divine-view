"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Editor", href: "/" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-4 px-4 bg-[#1a1a1a] border-b border-[#2a2a2a]">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "text-white" : "text-zinc-400 hover:text-white"
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
