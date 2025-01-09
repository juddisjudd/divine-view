"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFilterVotes } from "@/hooks/use-filter-votes";
import { useFilterDownloads } from "@/hooks/use-filter-downloads";
import { ThumbsUp, ThumbsDown, Download, Import } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { FilterResponse } from "@/types/api";
import Image from "next/image";

interface FilterCardProps {
  filter: FilterResponse;
  onVoteChange?: () => void;
}

export function FilterCard({ filter, onVoteChange }: FilterCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { vote, removeVote, isLoading: isVoting } = useFilterVotes();
  const { downloadFilter, isLoading: isDownloading } = useFilterDownloads();
  const [isImporting, setIsImporting] = useState(false);
  const [voteState, setVoteState] = useState({
    upvotes: filter.votes.upvotes,
    downvotes: filter.votes.downvotes,
    userVote: filter.votes.userVote,
  });

  const handleVote = async (value: 1 | -1) => {
    if (!isVoting) {
      const oldState = { ...voteState };
      try {
        if (voteState.userVote === value) {
          setVoteState({
            upvotes: voteState.upvotes - (value === 1 ? 1 : 0),
            downvotes: voteState.downvotes - (value === -1 ? 1 : 0),
            userVote: undefined,
          });
          const success = await removeVote(filter.id);
          if (!success) setVoteState(oldState);
        } else {
          setVoteState({
            upvotes:
              voteState.upvotes +
              (value === 1 ? 1 : 0) -
              (voteState.userVote === 1 ? 1 : 0),
            downvotes:
              voteState.downvotes +
              (value === -1 ? 1 : 0) -
              (voteState.userVote === -1 ? 1 : 0),
            userVote: value,
          });
          const success = await vote(filter.id, value);
          if (!success) setVoteState(oldState);
        }
        onVoteChange?.();
      } catch (error) {
        setVoteState(oldState);
      }
    }
  };

  const handleDownload = async () => {
    await downloadFilter(filter.id, filter.name);
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const response = await fetch(filter.githubUrl);
      if (!response.ok) throw new Error("Failed to fetch filter content");
      const content = await response.text();
      localStorage.setItem("importedFilter", content);
      localStorage.setItem("importedFilterName", filter.name);
      router.push("/");
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import filter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-full bg-[#030303] border-zinc-800 text-zinc-100">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              {filter.name}
            </h2>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>{filter.downloads} Downloads</span>
              <span>•</span>
              <span>{new Date(filter.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 bg-white hover:bg-zinc-100 font-semibold"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <span className="inline-flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Downloading...
                </span>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 bg-white hover:bg-zinc-100 font-semibold"
              onClick={handleImport}
              disabled={isImporting}
            >
              <Import className="h-4 w-4" />
              Import
            </Button>
          </div>
        </div>
        <p className="text-sm text-zinc-300">{filter.description}</p>
        <div className="flex flex-wrap gap-2">
          {filter.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="w-fit bg-yellow-500 hover:bg-yellow-400"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <Separator className="bg-zinc-800" />
      <CardFooter className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {filter.author.image && (
            <Image
              src={filter.author.image}
              alt={`${filter.author.name}'s avatar`}
              className="h-8 w-8 rounded-full bg-zinc-800"
              width={32}
              height={32}
            />
          )}
          <span className="text-sm text-zinc-400">by {filter.author.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 hover:text-zinc-100 hover:bg-zinc-800 ${
              voteState.userVote === 1 ? "text-green-500" : "text-zinc-400"
            }`}
            onClick={() => handleVote(1)}
            disabled={isVoting}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{voteState.upvotes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 hover:text-zinc-100 hover:bg-zinc-800 ${
              voteState.userVote === -1 ? "text-red-500" : "text-zinc-400"
            }`}
            onClick={() => handleVote(-1)}
            disabled={isVoting}
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{voteState.downvotes}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
