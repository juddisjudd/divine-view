"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { ThumbsUp, ThumbsDown, Download, Import } from "lucide-react";
import type { CommunityFilter } from "@/types/community";
import { toast } from "@/hooks/use-toast";

interface FilterCardProps {
  filter: CommunityFilter;
  onImport: (url: string) => void;
}

export function FilterCard({ filter, onImport }: FilterCardProps) {
  const { data: session } = useSession();

  const handleDownload = async () => {
    try {
      const response = await fetch(filter.githubUrl);
      const content = await response.text();
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filter.name}.filter`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download filter:", error);
    }
  };

  return (
    <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-white">{filter.name}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="bg-[#2a2a2a] border-[#3a3a3a] text-zinc-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="default"
            className="bg-zinc-800 text-white hover:bg-green-800"
            size="sm"
            onClick={() => {
              toast({
                variant: "destructive",
                description: "This feature is not yet available.",
                duration: 3000,
              });
            }}
          >
            <Import className="w-4 h-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {filter.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-400">
        <div className="flex items-center gap-2">
          <span>by {filter.author.name}</span>
          <span>•</span>
          <span>{filter.downloads.toLocaleString()} downloads</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-1 text-zinc-400 hover:text-white disabled:opacity-50"
            disabled={!session}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{filter.upvotes}</span>
          </button>
          <button
            className="flex items-center gap-1 text-zinc-400 hover:text-white disabled:opacity-50"
            disabled={!session}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>{filter.downvotes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
