"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dice1, Download } from "lucide-react";
import Link from "next/link";
import { getItemStyle } from "@/utils/filterParser";
import { FilterContext } from "@/types/filter";

interface ItemCriteria {
  class: string;
  baseType: string;
  rarity: 'Normal' | 'Magic' | 'Rare' | 'Unique';
  dropLevel: number;
  itemLevel: number;
  areaLevel: number;
  quality: number;
  sockets: number;
  stackSize: number;
  waystoneTier: number;
}

interface GeneratedItem {
  id: string;
  name: string;
  criteria: ItemCriteria;
  displayStyle: {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    beamColor?: string;
    fontSize?: number;
  };
}

const defaultCriteria: ItemCriteria = {
  class: "Amulets",
  baseType: "Solar Amulet",
  rarity: "Rare",
  dropLevel: 1,
  itemLevel: 70,
  areaLevel: 70,
  quality: 0,
  sockets: 0,
  stackSize: 1,
  waystoneTier: 1,
};

export default function SimulatorPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  // Restrict access to specific user for testing
  const isAuthorizedUser = session?.user?.name === "ohitsjudd#7248";
  const [criteria, setCriteria] = useState<ItemCriteria>(defaultCriteria);
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [userFilters, setUserFilters] = useState<Array<{id: string; filter_name: string}>>([]);
  const [selectedFilterContent, setSelectedFilterContent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Load user's filters
  useEffect(() => {
    const loadUserFilters = async () => {
      if (!session?.user?.accessToken) return;
      
      try {
        const response = await fetch('/api/poe/item-filter');
        if (response.ok) {
          const data = await response.json();
          setUserFilters(data.filters || []);
        }
      } catch (error) {
        console.error('Failed to load filters:', error);
      }
    };

    loadUserFilters();
  }, [session]);

  // Load selected filter content
  const loadFilterContent = async (filterId: string) => {
    if (!filterId || !session?.user?.accessToken) {
      setSelectedFilterContent("");
      return;
    }

    try {
      const response = await fetch(`/api/poe/item-filter/${filterId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedFilterContent(data.filter?.filter || "");
      }
    } catch (error) {
      console.error('Failed to load filter content:', error);
      toast({
        title: "Error",
        description: "Failed to load filter content",
        variant: "destructive",
      });
    }
  };

  // Handle filter selection
  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId);
    loadFilterContent(filterId);
  };

  const generateItem = () => {
    setLoading(true);
    
    // Create filter context from criteria
    const filterContext: FilterContext = {
      baseType: criteria.baseType,
      itemClass: criteria.class,
      rarity: criteria.rarity,
      areaLevel: criteria.areaLevel,
      itemLevel: criteria.itemLevel,
      quality: criteria.quality,
      sockets: criteria.sockets,
      stackSize: criteria.stackSize,
    };

    // Get item styling from filter or use default
    let displayStyle;
    let isHidden = false;

    if (selectedFilterContent) {
      try {
        const filterResult = getItemStyle(selectedFilterContent, filterContext);
        isHidden = filterResult.isHidden;
        displayStyle = {
          backgroundColor: filterResult.style.backgroundColor || "rgba(255, 255, 255, 0.1)",
          textColor: filterResult.style.textColor || "#c8c8c8",
          borderColor: filterResult.style.borderColor || "#666666",
          beamColor: filterResult.style.beam?.color,
          fontSize: filterResult.style.fontSize || 32,
        };
      } catch (error) {
        console.error('Filter parsing error:', error);
        displayStyle = getItemDisplayStyle(criteria);
      }
    } else {
      displayStyle = getItemDisplayStyle(criteria);
    }

    // Generate a unique item based on criteria
    const newItem: GeneratedItem = {
      id: Date.now().toString(),
      name: generateItemName(criteria),
      criteria: { ...criteria },
      displayStyle,
    };

    // Only add visible items to the list
    if (!isHidden) {
      setGeneratedItems(prev => [newItem, ...prev.slice(0, 9)]); // Keep last 10 items
      toast({
        title: "Item Generated",
        description: `Generated ${newItem.name}`,
      });
    } else {
      toast({
        title: "Item Hidden",
        description: `${newItem.name} was filtered out by your loot filter`,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const generateItemName = (criteria: ItemCriteria): string => {
    const prefixes = ["Glowing", "Ancient", "Masterful", "Divine", "Ethereal", "Corrupted"];
    const suffixes = ["of Power", "of the Storm", "of Eternity", "of Destruction", "of Wisdom"];
    
    switch (criteria.rarity) {
      case "Normal":
        return criteria.baseType;
      case "Magic":
        return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${criteria.baseType}`;
      case "Rare":
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return `${prefix} ${criteria.baseType} ${suffix}`;
      case "Unique":
        return `The ${criteria.baseType} of Legends`;
      default:
        return criteria.baseType;
    }
  };

  const getItemDisplayStyle = (criteria: ItemCriteria) => {
    switch (criteria.rarity) {
      case "Normal":
        return {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          textColor: "#c8c8c8",
          borderColor: "#666666",
        };
      case "Magic":
        return {
          backgroundColor: "rgba(136, 136, 255, 0.2)",
          textColor: "#8888ff",
          borderColor: "#8888ff",
          beamColor: "#8888ff",
        };
      case "Rare":
        return {
          backgroundColor: "rgba(255, 255, 119, 0.2)",
          textColor: "#ffff77",
          borderColor: "#ffff77",
          beamColor: "#ffff77",
        };
      case "Unique":
        return {
          backgroundColor: "rgba(175, 96, 37, 0.3)",
          textColor: "#af6025",
          borderColor: "#af6025",
          beamColor: "#af6025",
        };
      default:
        return {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          textColor: "#c8c8c8",
          borderColor: "#666666",
        };
    }
  };

  if (!session) {
    return (
      <DefaultLayout>
        <div className="container mx-auto py-6 px-4 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-white">Loot Drop Simulator</h1>
            <p className="text-zinc-400">
              Please sign in with your Path of Exile account to use the simulator.
            </p>
            <Link href="/">
              <Button>Go to Editor</Button>
            </Link>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!isAuthorizedUser) {
    return (
      <DefaultLayout>
        <div className="container mx-auto py-6 px-4 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-white">Loot Drop Simulator</h1>
            <div className="bg-[#1a1a1a] border border-orange-500 rounded-lg p-6">
              <div className="text-orange-400 text-6xl mb-4">🚧</div>
              <h2 className="text-xl font-semibold text-orange-400 mb-2">Under Development</h2>
              <p className="text-zinc-400 mb-4">
                The Loot Drop Simulator is currently in development and not yet available for public use.
              </p>
              <p className="text-zinc-500 text-sm">
                Check back later for access to this feature!
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" className="text-zinc-400 hover:text-white">
                Go to Editor
              </Button>
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
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">Loot Drop Simulator</h1>
            <p className="text-zinc-400">
              Generate items and see how they would appear with your loot filter
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls Panel */}
            <Card className="p-6 bg-[#1a1a1a] border-[#2a2a2a]">
              <h2 className="text-xl font-semibold text-white mb-4">Item Generation</h2>
              
              <div className="space-y-4">
                {/* Filter Selection */}
                <div className="space-y-2">
                  <Label className="text-zinc-300">Select Filter</Label>
                  <select
                    value={selectedFilter}
                    onChange={(e) => handleFilterSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] text-white rounded-md"
                  >
                    <option value="">Default (No Filter)</option>
                    {userFilters.map((filter) => (
                      <option key={filter.id} value={filter.id}>
                        {filter.filter_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Item Class */}
                <div className="space-y-2">
                  <Label className="text-zinc-300">Class</Label>
                  <select
                    value={criteria.class}
                    onChange={(e) => setCriteria(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] text-white rounded-md"
                  >
                    <option value="Amulets">Amulets</option>
                    <option value="Body Armours">Body Armours</option>
                    <option value="Boots">Boots</option>
                    <option value="Gloves">Gloves</option>
                    <option value="Helmets">Helmets</option>
                    <option value="Rings">Rings</option>
                    <option value="Shields">Shields</option>
                    <option value="Weapons">Weapons</option>
                    <option value="Currency">Currency</option>
                    <option value="Gems">Gems</option>
                  </select>
                </div>

                {/* Base Type */}
                <div className="space-y-2">
                  <Label className="text-zinc-300">Base Type</Label>
                  <Input
                    value={criteria.baseType}
                    onChange={(e) => setCriteria(prev => ({ ...prev, baseType: e.target.value }))}
                    className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
                    placeholder="e.g., Solar Amulet"
                  />
                </div>

                {/* Rarity */}
                <div className="space-y-2">
                  <Label className="text-zinc-300">Rarity</Label>
                  <select
                    value={criteria.rarity}
                    onChange={(e) => setCriteria(prev => ({ ...prev, rarity: e.target.value as 'Normal' | 'Magic' | 'Rare' | 'Unique' }))}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] text-white rounded-md"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Magic">Magic</option>
                    <option value="Rare">Rare</option>
                    <option value="Unique">Unique</option>
                  </select>
                </div>

                {/* Levels and Properties Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Drop Level</Label>
                    <Input
                      type="number"
                      value={criteria.dropLevel}
                      onChange={(e) => setCriteria(prev => ({ ...prev, dropLevel: parseInt(e.target.value) || 0 }))}
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
                      min="1"
                      max="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300">Item Level</Label>
                    <Input
                      type="number"
                      value={criteria.itemLevel}
                      onChange={(e) => setCriteria(prev => ({ ...prev, itemLevel: parseInt(e.target.value) || 0 }))}
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
                      min="1"
                      max="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300">Area Level</Label>
                    <Input
                      type="number"
                      value={criteria.areaLevel}
                      onChange={(e) => setCriteria(prev => ({ ...prev, areaLevel: parseInt(e.target.value) || 0 }))}
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
                      min="1"
                      max="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300">Quality</Label>
                    <Input
                      type="number"
                      value={criteria.quality}
                      onChange={(e) => setCriteria(prev => ({ ...prev, quality: parseInt(e.target.value) || 0 }))}
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
                      min="0"
                      max="20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300">Sockets</Label>
                    <Input
                      type="number"
                      value={criteria.sockets}
                      onChange={(e) => setCriteria(prev => ({ ...prev, sockets: parseInt(e.target.value) || 0 }))}
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
                      min="0"
                      max="6"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300">Stack Size</Label>
                    <Input
                      type="number"
                      value={criteria.stackSize}
                      onChange={(e) => setCriteria(prev => ({ ...prev, stackSize: parseInt(e.target.value) || 1 }))}
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
                      min="1"
                    />
                  </div>
                </div>

                {/* Waystone Tier */}
                <div className="space-y-2">
                  <Label className="text-zinc-300">Waystone Tier</Label>
                  <Input
                    type="number"
                    value={criteria.waystoneTier}
                    onChange={(e) => setCriteria(prev => ({ ...prev, waystoneTier: parseInt(e.target.value) || 1 }))}
                    className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
                    min="1"
                    max="20"
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateItem}
                  disabled={loading}
                  className="w-full bg-[#922729] hover:bg-[#7a1f21] text-white"
                >
                  <Dice1 className="w-4 h-4 mr-2" />
                  Generate Item Drop
                </Button>
              </div>
            </Card>

            {/* Preview Panel */}
            <Card className="p-6 bg-[#1a1a1a] border-[#2a2a2a]">
              <h2 className="text-xl font-semibold text-white mb-4">Loot Preview</h2>
              
              {/* Game Background */}
              <div
                className="relative min-h-[400px] rounded-lg overflow-hidden"
                style={{
                  backgroundImage: "url('/images/preview-bg.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                {/* Generated Items */}
                <div className="absolute inset-0 p-4">
                  {generatedItems.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-zinc-400 text-center">
                        Generate an item to see how it appears in-game
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {generatedItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="inline-block px-3 py-2 rounded border-2 font-medium shadow-lg transition-all duration-300"
                          style={{
                            backgroundColor: item.displayStyle.backgroundColor,
                            color: item.displayStyle.textColor,
                            borderColor: item.displayStyle.borderColor,
                            fontSize: Math.max(12, Math.min(24, (item.displayStyle.fontSize || 32) / 2)),
                            boxShadow: item.displayStyle.beamColor 
                              ? `0 0 15px ${item.displayStyle.beamColor}, 0 0 30px ${item.displayStyle.beamColor}20` 
                              : "0 2px 4px rgba(0,0,0,0.3)",
                            opacity: index === 0 ? 1 : Math.max(0.4, 1 - (index * 0.15)),
                            transform: index === 0 ? "scale(1)" : `scale(${Math.max(0.8, 1 - (index * 0.05))})`,
                            textShadow: item.displayStyle.beamColor 
                              ? `0 0 8px ${item.displayStyle.beamColor}` 
                              : "none",
                          }}
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Items List */}
              {generatedItems.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-lg font-medium text-white">Recent Drops</h3>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {generatedItems.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="text-sm p-2 rounded bg-[#2a2a2a] border border-[#3a3a3a]"
                      >
                        <span style={{ color: item.displayStyle.textColor }}>
                          {item.name}
                        </span>
                        <span className="text-zinc-500 ml-2">
                          ({item.criteria.rarity})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}