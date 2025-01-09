"use client";

import { useState } from "react";
import { SubmitFilterDialog } from "@/components/community/SubmitFilterDialog";
import { FilterCard } from "@/components/community/FilterCard";
import { FilterControls } from "@/components/community/FilterControls";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { useFilters } from "@/hooks/use-filters";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { FilterResponse } from "@/types/api";

const ITEMS_PER_PAGE = 10;

function FilterCardSkeleton() {
  return (
    <div className="w-full p-6 bg-[#030303] border border-zinc-800 rounded-lg space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-zinc-800" />
          <Skeleton className="h-4 w-48 bg-zinc-800" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 bg-zinc-800" />
          <Skeleton className="h-9 w-24 bg-zinc-800" />
        </div>
      </div>
      <Skeleton className="h-4 w-full bg-zinc-800" />
      <Skeleton className="h-6 w-20 bg-zinc-800" />
    </div>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const showPages = 5;
    const halfShow = Math.floor(showPages / 2);

    let start = Math.max(1, currentPage - halfShow);
    let end = Math.min(totalPages, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
            className={
              currentPage === 1 ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>

        {currentPage > 2 && (
          <>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(1);
                }}
              >
                1
              </PaginationLink>
            </PaginationItem>
            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}

        {getPageNumbers().map((pageNum) => (
          <PaginationItem key={pageNum}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(pageNum);
              }}
              isActive={pageNum === currentPage}
            >
              {pageNum}
            </PaginationLink>
          </PaginationItem>
        ))}

        {currentPage < totalPages - 1 && (
          <>
            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(totalPages);
                }}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
            className={
              currentPage === totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function CommunityPageContent() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);

  const { filters, isLoading } = useFilters();

  const filteredAndSortedFilters = filters
    ?.filter((filter) =>
      selectedTags.length === 0
        ? true
        : selectedTags.some((tag) => filter.tags.includes(tag))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "upvotes":
          return (
            b.votes.upvotes -
            b.votes.downvotes -
            (a.votes.upvotes - a.votes.downvotes)
          );
        case "recent":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  const totalPages = Math.ceil(
    (filteredAndSortedFilters?.length || 0) / ITEMS_PER_PAGE
  );
  const paginatedFilters = filteredAndSortedFilters?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <FilterCardSkeleton />
        <FilterCardSkeleton />
        <FilterCardSkeleton />
      </div>
    );
  }

  if (!filters?.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        No filters found. Be the first to submit one!
      </div>
    );
  }

  return (
    <>
      <FilterControls
        selectedTags={selectedTags}
        sortBy={sortBy}
        onTagChange={(tags) => {
          setSelectedTags(tags);
          setCurrentPage(1);
        }}
        onSortChange={(value) => {
          setSortBy(value);
          setCurrentPage(1);
        }}
      />
      <div className="grid gap-4">
        {paginatedFilters?.map((filter: FilterResponse) => (
          <FilterCard key={filter.id} filter={filter} />
        ))}
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}

export default function CommunityPage() {
  return (
    <DefaultLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Community Filters</h1>
          <SubmitFilterDialog />
        </div>
        <ErrorBoundary>
          <CommunityPageContent />
        </ErrorBoundary>
      </div>
    </DefaultLayout>
  );
}
