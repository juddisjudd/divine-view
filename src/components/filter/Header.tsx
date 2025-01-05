import React from "react";
import AuthButton from "@/components/auth/AuthButton";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-[#2a2a2a]">
      <div>
        <h1 className="text-white text-lg font-medium">Divine View</h1>
        <h2 className="text-zinc-400 text-sm">PoE2 Loot Filter Editor</h2>
      </div>
      <AuthButton />
    </header>
  );
}
