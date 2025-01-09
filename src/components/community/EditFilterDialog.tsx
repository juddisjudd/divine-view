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
import { useFilters } from "@/hooks/use-filters";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { X, Edit2 } from "lucide-react";
import type { FilterResponse } from "@/types/api";

const AVAILABLE_TAGS = [
  "Leveling",
  "Intermediate",
  "Endgame",
  "Cosmetic Only",
  "Strict",
  "Semi-strict",
  "VeryStrict",
  "UberStrict",
  "Hardcore",
  "Softcore",
] as const;

interface EditFilterDialogProps {
  filter: FilterResponse;
  onSuccess?: () => void;
}

export function EditFilterDialog({ filter, onSuccess }: EditFilterDialogProps) {
  const { updateFilter, isLoading } = useFilters();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(filter.name);
  const [description, setDescription] = useState(filter.description || "");
  const [githubUrl, setGithubUrl] = useState(filter.githubUrl);
  const [selectedTags, setSelectedTags] = useState<string[]>(filter.tags);
  const [isValidating, setIsValidating] = useState(false);

  const resetForm = () => {
    setName(filter.name);
    setDescription(filter.description || "");
    setGithubUrl(filter.githubUrl);
    setSelectedTags(filter.tags);
  };

  const validateGithubUrl = async (url: string) => {
    if (
      !url.startsWith("https://raw.githubusercontent.com/") ||
      !url.endsWith(".filter")
    ) {
      return false;
    }

    try {
      const response = await fetch(url);
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !githubUrl || selectedTags.length === 0) {
      return;
    }

    setIsValidating(true);
    const isValid = await validateGithubUrl(githubUrl);
    setIsValidating(false);

    if (!isValid) {
      toast({
        title: "Invalid GitHub URL",
        description: "Please provide a valid raw GitHub URL for a .filter file",
        variant: "destructive",
      });
      return;
    }

    const result = await updateFilter(filter.id, {
      name,
      description,
      githubUrl,
      tags: selectedTags,
    });

    if (result) {
      setIsOpen(false);
      onSuccess?.();
      toast({
        title: "Success",
        description: "Filter updated successfully",
      });
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 hover:text-zinc-100 hover:bg-zinc-800"
        >
          <Edit2 className="h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#121212] border-zinc-800 text-white max-w-2xl p-6">
        <div className="absolute right-4 top-4">
          <button
            onClick={() => setIsOpen(false)}
            className="text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <DialogHeader className="mb-6">
          <DialogTitle className="text-[#22c55e] text-xl">
            Edit Filter
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-200">
              Filter Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#1a1a1a] border-zinc-700 text-white"
              placeholder="Enter filter name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-zinc-200">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#1a1a1a] border-zinc-700 text-white min-h-[100px] resize-none"
              placeholder="Enter a brief description of your filter"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubUrl" className="text-zinc-200">
              GitHub Raw URL
            </Label>
            <Input
              id="githubUrl"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="bg-[#1a1a1a] border-zinc-700 text-white font-mono text-sm"
              placeholder="https://raw.githubusercontent.com/user/repo/main/filter.filter"
              required
            />
            <p className="text-sm text-zinc-400">
              Provide the raw GitHub URL for your filter file (must end in
              .filter)
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-200">Tags</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "secondary"}
                  className={`rounded-full px-3 py-1 cursor-pointer text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-zinc-200 text-zinc-900 hover:bg-zinc-300"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              className="bg-transparent border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                isValidating ||
                !name ||
                !githubUrl ||
                selectedTags.length === 0
              }
              className="bg-[#22c55e] hover:bg-[#22c55e]/90 text-white"
            >
              {isLoading || isValidating ? "Updating..." : "Update Filter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
