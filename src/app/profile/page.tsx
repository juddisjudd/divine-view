"use client";

import { useSession } from "next-auth/react";
import "@/types/auth"; // Import extended session types
import { useState, useEffect, useCallback, useMemo } from "react";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { type PoEFilter } from "@/lib/poe-api";
import { Download, Eye, EyeOff, Upload, RefreshCw, Edit } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

function FilterCard({ filter, onSync }: {
  filter: PoEFilter;
  onSync: () => void;
}) {
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      // Fetch the full filter content from the API
      const response = await fetch(`/api/poe/item-filter/${filter.id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const fullFilter = await response.json();
      console.log('Full filter response:', fullFilter); // Debug log
      
      // API returns { filter: ItemFilter } where ItemFilter.filter contains the content
      const filterContent = fullFilter.filter?.filter || '';
      
      if (!filterContent) {
        toast({
          title: "Error",
          description: "Filter content is empty",
          variant: "destructive",
        });
        return;
      }
      
      const blob = new Blob([filterContent], { type: 'text/plain' });
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
    } catch (error) {
      console.error('Failed to download filter:', error);
      toast({
        title: "Error",
        description: "Failed to download filter",
        variant: "destructive",
      });
    }
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              >
                <Download className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2 bg-zinc-900 border-zinc-700 text-white text-sm">
              Download filter
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onSync}
                className="bg-blue-900 border-blue-700 text-blue-300 hover:bg-blue-800 hover:text-blue-200"
              >
                <Edit className="w-4 h-4 text-black" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2 bg-zinc-900 border-zinc-700 text-white text-sm">
              Edit in editor
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Card>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [filters, setFilters] = useState<PoEFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Memoize filter stats to avoid recalculating on every render
  const filterStats = useMemo(() => ({
    total: filters.length,
    public: filters.filter(f => f.public).length,
    ruthless: filters.filter(f => f.type === 'Ruthless').length,
  }), [filters]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.accessToken, status]);

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


  const handleSyncFilter = async (filter: PoEFilter) => {
    try {
      // Fetch the full filter content from the API
      const response = await fetch(`/api/poe/item-filter/${filter.id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const fullFilter = await response.json();
      console.log('Full filter sync response:', fullFilter); // Debug log
      
      // API returns { filter: ItemFilter } where ItemFilter.filter contains the content
      const filterContent = fullFilter.filter?.filter || '';
      
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
      localStorage.setItem('importedFilterId', filter.id);
      
      toast({
        title: "Filter Synced",
        description: `${filter.filter_name} has been loaded into the editor`,
      });

      // Redirect to the editor page
      router.push('/');
    } catch (error) {
      console.error('Failed to sync filter:', error);
      toast({
        title: "Error",
        description: "Failed to load filter content",
        variant: "destructive",
      });
    }
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
                <div className="text-2xl font-bold text-white">{filterStats.total}</div>
                <div className="text-sm text-zinc-400">Total Filters</div>
              </div>
            </Card>
            <Card className="p-4 bg-[#1a1a1a] border-[#2a2a2a]">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {filterStats.public}
                </div>
                <div className="text-sm text-zinc-400">Public Filters</div>
              </div>
            </Card>
            <Card className="p-4 bg-[#1a1a1a] border-[#2a2a2a]">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {filterStats.ruthless}
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