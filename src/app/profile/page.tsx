"use client";

import { useSession } from "next-auth/react";
import "@/types/auth"; // Import extended session types
import { useState, useEffect, useCallback } from "react";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { type PoEFilter } from "@/lib/poe-api";
import { Download, Eye, EyeOff, Trash2, Upload, RefreshCw } from "lucide-react";
import Link from "next/link";

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 bg-zinc-800" />
        <Skeleton className="h-4 w-48 bg-zinc-800" />
      </div>
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-6 bg-[#1a1a1a] border-[#2a2a2a]">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48 bg-zinc-800" />
                <Skeleton className="h-4 w-32 bg-zinc-800" />
              </div>
              <Skeleton className="h-8 w-20 bg-zinc-800" />
            </div>
            <Skeleton className="h-4 w-full bg-zinc-800" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function FilterCard({ filter, onSync, onDelete }: {
  filter: PoEFilter;
  onSync: () => void;
  onDelete: () => void;
}) {
  const { toast } = useToast();

  const handleDownload = () => {
    const blob = new Blob([filter.filter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filter.filter_name}.filter`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Filter Downloaded",
      description: `${filter.filter_name} has been downloaded`,
    });
  };


  return (
    <Card className="p-4 bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors">
      <div className="flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white truncate">{filter.filter_name}</h3>
            {filter.version && <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">v{filter.version}</span>}
          </div>
          <div className="flex items-center gap-2 mb-2">
            {filter.type && (
              <Badge variant={filter.type === 'Ruthless' ? 'destructive' : 'default'}>
                {filter.type}
              </Badge>
            )}
            {filter.public ? (
              <Badge variant="outline" className="text-green-400 border-green-400">
                <Eye className="w-3 h-3 mr-1" />
                Public
              </Badge>
            ) : (
              <Badge variant="outline" className="text-zinc-400">
                <EyeOff className="w-3 h-3 mr-1" />
                Private
              </Badge>
            )}
          </div>
          {filter.description && (
            <p className="text-zinc-400 text-sm truncate">{filter.description}</p>
          )}
        </div>
        <div className="flex gap-1 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="text-zinc-400 hover:text-white"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSync}
            className="text-blue-400 hover:text-blue-300"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [filters, setFilters] = useState<PoEFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFilters = useCallback(async () => {
    if (!session?.user?.accessToken) return;
    
    try {
      const response = await fetch('/api/poe/item-filter');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFilters(data.filters);
    } catch (error) {
      console.error('Failed to load filters:', error);
      toast({
        title: "Error",
        description: "Failed to load your Path of Exile filters",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.user?.accessToken, toast]);

  useEffect(() => {
    if (session?.user?.accessToken) {
      loadFilters();
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [session, status, loadFilters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFilters();
  };

  const handleSyncFromEditor = async () => {
    // This would sync the current editor content to PoE
    // For now, just show a placeholder
    toast({
      title: "Sync from Editor",
      description: "This feature will sync your current editor content to PoE",
    });
  };

  const handleDeleteFilter = async (filterId: string) => {
    if (!session?.user?.accessToken) return;
    
    try {
      const response = await fetch(`/api/poe/item-filter/${filterId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setFilters(filters.filter(f => f.id !== filterId));
      toast({
        title: "Filter Deleted",
        description: "Filter has been removed from your PoE account",
      });
    } catch (error) {
      console.error('Failed to delete filter:', error);
      toast({
        title: "Error",
        description: "Failed to delete filter",
        variant: "destructive",
      });
    }
  };

  const handleSyncFilter = async (filter: PoEFilter) => {
    // This would load the filter content into the editor
    // Store in localStorage for the editor to pick up
    console.log('Syncing filter:', filter); // Debug log
    const filterContent = filter.filter || '';
    
    if (!filterContent) {
      toast({
        title: "Error",
        description: "Filter content is empty or undefined",
        variant: "destructive",
      });
      return;
    }
    
    localStorage.setItem('importedFilter', filterContent);
    localStorage.setItem('importedFilterName', filter.filter_name);
    
    toast({
      title: "Filter Synced",
      description: `${filter.filter_name} has been loaded into the editor`,
    });
  };

  if (status === "loading" || loading) {
    return (
      <DefaultLayout>
        <div className="container mx-auto py-6 px-4">
          <ProfileSkeleton />
        </div>
      </DefaultLayout>
    );
  }

  if (!session) {
    return (
      <DefaultLayout>
        <div className="container mx-auto py-6 px-4 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <p className="text-zinc-400">
              Please sign in with your Path of Exile account to view and manage your filters.
            </p>
            <Link href="/">
              <Button>Go to Editor</Button>
            </Link>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">
                Welcome, {session.user?.name}
              </h1>
              <p className="text-zinc-400">
                Manage your Path of Exile item filters
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSyncFromEditor}
                className="bg-[#922729] hover:bg-[#7a1f21] text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Sync from Editor
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-zinc-400 hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Filter Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-[#1a1a1a] border-[#2a2a2a]">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{filters.length}</div>
                <div className="text-sm text-zinc-400">Total Filters</div>
              </div>
            </Card>
            <Card className="p-4 bg-[#1a1a1a] border-[#2a2a2a]">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {filters.filter(f => f.public).length}
                </div>
                <div className="text-sm text-zinc-400">Public Filters</div>
              </div>
            </Card>
            <Card className="p-4 bg-[#1a1a1a] border-[#2a2a2a]">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {filters.filter(f => f.type === 'Ruthless').length}
                </div>
                <div className="text-sm text-zinc-400">Ruthless Filters</div>
              </div>
            </Card>
          </div>

          {/* Filters List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Your Filters</h2>
            {filters.length === 0 ? (
              <Card className="p-8 bg-[#1a1a1a] border-[#2a2a2a] text-center">
                <div className="space-y-2">
                  <p className="text-zinc-400">No filters found in your PoE account</p>
                  <p className="text-sm text-zinc-500">
                    Create and sync filters using the editor to see them here
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-2">
                {filters.map((filter) => (
                  <FilterCard
                    key={filter.id}
                    filter={filter}
                    onSync={() => handleSyncFilter(filter)}
                    onDelete={() => handleDeleteFilter(filter.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}