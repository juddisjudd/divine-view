"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import type { FilterTag } from "@/types/community";

const AVAILABLE_TAGS: FilterTag[] = [
  "Leveling",
  "Intermediate",
  "Endgame",
  "Cosmetic Only",
  "Warrior",
  "Witch",
  "Ranger",
  "Sorceress",
  "Mercenary",
  "Monk",
  "Druid",
  "Huntress",
  "Shadow",
  "Templar",
  "Marauder",
  "Duelist",
];

interface SubmitFilterDialogProps {
  onSubmit: (data: {
    name: string;
    githubUrl: string;
    tags: FilterTag[];
  }) => Promise<void>;
}

export function SubmitFilterDialog({ onSubmit }: SubmitFilterDialogProps) {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [selectedTags, setSelectedTags] = useState<FilterTag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !githubUrl || selectedTags.length === 0) {
      setError("Please fill in all required fields");
      return;
    }

    if (!githubUrl.endsWith(".filter")) {
      setError("GitHub URL must point to a .filter file");
      return;
    }

    try {
      await onSubmit({ name, githubUrl, tags: selectedTags });
      setIsOpen(false);
      setName("");
      setGithubUrl("");
      setSelectedTags([]);
    } catch (err) {
      setError("Failed to submit filter. Please try again.");
    }
  };

  const toggleTag = (tag: FilterTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (!session) {
    return (
      <Button disabled className="bg-[#2a2a2a] text-zinc-400">
        Login to Submit Filter
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Submit Filter</Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
        <DialogHeader>
          <DialogTitle>Submit a Filter</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Filter Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
            />
          </div>
          <div>
            <Label htmlFor="github">GitHub URL</Label>
            <Input
              id="github"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/user/repo/blob/main/filter.filter"
              className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
            />
          </div>
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {AVAILABLE_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
