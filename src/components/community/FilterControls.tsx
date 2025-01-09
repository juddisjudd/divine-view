"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest" },
  { value: "upvotes", label: "Highest Rated" },
] as const;

interface FilterControlsProps {
  selectedTags: string[];
  sortBy: string;
  onTagChange: (tags: string[]) => void;
  onSortChange: (sort: string) => void;
}

export function FilterControls({
  selectedTags,
  sortBy,
  onTagChange,
  onSortChange,
}: FilterControlsProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedTags.length === 0 ? "default" : "secondary"}
          className={`cursor-pointer ${
            selectedTags.length === 0
              ? "bg-zinc-200 text-zinc-900"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
          onClick={() => onTagChange([])}
        >
          All
        </Badge>
        {AVAILABLE_TAGS.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "secondary"}
            className={`cursor-pointer ${
              selectedTags.includes(tag)
                ? "bg-zinc-200 text-zinc-900"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px] bg-[#2a2a2a] border-[#3a3a3a] text-gray-200">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a]">
          {SORT_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-gray-200"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
