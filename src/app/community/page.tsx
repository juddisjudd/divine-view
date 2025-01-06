"use client";

import { useState } from "react";
import { SubmitFilterDialog } from "@/components/community/SubmitFilterDialog";
import { FilterCard } from "@/components/community/FilterCard";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import type { CommunityFilter, FilterTag } from "@/types/community";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const MOCK_FILTERS: CommunityFilter[] = [
  {
    id: "1",
    name: "NeverSink's Litefilter",
    tags: ["Cosmetic Only"] as FilterTag[],
    author: {
      id: "1",
      name: "@NeverSinkDev",
    },
    githubUrl:
      "https://raw.githubusercontent.com/NeverSinkDev/NeverSink-PoE2litefilter/refs/heads/main/NeverSinks%20Litefilter.filter",
    downloads: 42069,
    upvotes: 100,
    downvotes: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "cdr-end-strict",
    tags: ["Endgame"] as FilterTag[],
    author: {
      id: "2",
      name: "@cdrg",
    },
    githubUrl:
      "https://raw.githubusercontent.com/cdrg/cdr-poe2filter/refs/heads/main/cdr-end-strict.filter",
    downloads: 42069,
    upvotes: 100,
    downvotes: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "cdr-endgame",
    tags: ["Endgame"] as FilterTag[],
    author: {
      id: "2",
      name: "@cdrg",
    },
    githubUrl:
      "https://raw.githubusercontent.com/cdrg/cdr-poe2filter/refs/heads/main/cdr-endgame.filter",
    downloads: 42069,
    upvotes: 100,
    downvotes: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Fubgun_Basic",
    tags: ["Leveling"] as FilterTag[],
    author: {
      id: "2",
      name: "@PoEDave",
    },
    githubUrl:
      "https://raw.githubusercontent.com/PoEDave/FubgunFilters/refs/heads/main/Fubgun_Basic.filter",
    downloads: 42069,
    upvotes: 100,
    downvotes: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Fubgun_Strict",
    tags: ["Endgame"] as FilterTag[],
    author: {
      id: "3",
      name: "@PoEDave",
    },
    githubUrl:
      "https://raw.githubusercontent.com/PoEDave/FubgunFilters/refs/heads/main/Fubgun_Strict.filter",
    downloads: 42069,
    upvotes: 100,
    downvotes: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Fubgun_VeryStrict",
    tags: ["Endgame"] as FilterTag[],
    author: {
      id: "3",
      name: "@PoEDave",
    },
    githubUrl:
      "https://raw.githubusercontent.com/PoEDave/FubgunFilters/refs/heads/main/Fubgun_VeryStrict.filter",
    downloads: 42069,
    upvotes: 100,
    downvotes: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "7",
    name: "Fubgun_UberStrict",
    tags: ["Endgame"] as FilterTag[],
    author: {
      id: "3",
      name: "@PoEDave",
    },
    githubUrl:
      "https://raw.githubusercontent.com/PoEDave/FubgunFilters/refs/heads/main/Fubgun_UberStrict.filter",
    downloads: 42069,
    upvotes: 100,
    downvotes: 0,
    createdAt: new Date().toISOString(),
  },
];

export default function CommunityPage() {
  const [filters, setFilters] = useState<CommunityFilter[]>(MOCK_FILTERS);

  const handleFilterSubmit = async (data: {
    name: string;
    githubUrl: string;
    tags: FilterTag[];
  }) => {
    const newFilter: CommunityFilter = {
      id: Math.random().toString(),
      name: data.name,
      tags: data.tags,
      author: {
        id: "current-user",
        name: "@current-user",
      },
      githubUrl: data.githubUrl,
      downloads: 0,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString(),
    };

    setFilters((prev) => [...prev, newFilter]);
  };

  const handleImport = async (url: string) => {
    try {
      const response = await fetch(url);
      const filterContent = await response.text();
      console.log("Filter content:", filterContent);
    } catch (error) {
      console.error("Failed to import filter:", error);
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="bg-red-700 text-white text-center py-2 mb-4 font-bold">
          This page is Under Development. Download counts and ratings are
          placeholders.
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Community Filters</h1>
          <Button
            variant="default"
            onClick={() => {
              toast({
                variant: "destructive",
                description: "This feature is not yet available.",
                duration: 3000,
              });
            }}
          >
            Submit Filter
          </Button>
        </div>

        <div className="grid gap-4">
          {filters.map((filter) => (
            <FilterCard
              key={filter.id}
              filter={filter}
              onImport={handleImport}
            />
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
}
