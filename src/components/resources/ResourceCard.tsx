import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ResourceCardProps {
  title: string;
  description: string;
  url: string;
}

export function ResourceCard({ title, description, url }: ResourceCardProps) {
  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-4 hover:bg-[#2a2a2a] transition-colors">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col gap-2"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium">{title}</h3>
          <ExternalLink className="w-4 h-4 text-zinc-400" />
        </div>
        <p className="text-sm text-zinc-400">{description}</p>
      </a>
    </Card>
  );
}
