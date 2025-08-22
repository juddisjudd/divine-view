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
import { BaseTypeData, parseBaseTypesCSV, getUniqueClasses, getBaseTypesForClass, findBaseType } from "@/utils/baseTypesData";

interface ItemCriteria {
  class: string;
  baseType: string;
  rarity: 'Normal' | 'Magic' | 'Rare' | 'Unique';
  itemLevel: number;
  areaLevel: number;
  dropLevel: number;
  quality: number;
  sockets: number;
  stackSize: number;
}

interface ModifierToggles {
  rarity: boolean;
  itemLevel: boolean;
  areaLevel: boolean;
  dropLevel: boolean;
  quality: boolean;
  sockets: boolean;
  stackSize: boolean;
}

interface GeneratedItem {
  id: string;
  name: string;
  criteria: ItemCriteria;
  modifierToggles: ModifierToggles;
  displayStyle: {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    beamColor?: string;
    fontSize?: number;
  };
  isHidden: boolean;
}

const defaultCriteria: ItemCriteria = {
  class: "Amulets",
  baseType: "Solar Amulet",
  rarity: "Rare",
  itemLevel: 70,
  areaLevel: 70,
  dropLevel: 60,
  quality: 0,
  sockets: 0,
  stackSize: 1,
};

const defaultToggles: ModifierToggles = {
  rarity: true,
  itemLevel: false,
  areaLevel: true, // Baseline scenario modifier
  dropLevel: false,
  quality: false,
  sockets: false,
  stackSize: false,
};

export default function SimulatorPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  // Allow all authenticated users
  const isAuthorizedUser = true;
  const [criteria, setCriteria] = useState<ItemCriteria>(defaultCriteria);
  const [modifierToggles, setModifierToggles] = useState<ModifierToggles>(defaultToggles);
  const [currentItem, setCurrentItem] = useState<GeneratedItem | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [userFilters, setUserFilters] = useState<Array<{id: string; filter_name: string}>>([]);
  const [selectedFilterContent, setSelectedFilterContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [baseTypesData, setBaseTypesData] = useState<BaseTypeData[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableBaseTypes, setAvailableBaseTypes] = useState<BaseTypeData[]>([]);

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

  // Handle Z key for showing hidden items (like PoE)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'z' || event.key === 'Z') {
        setShowHidden(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'z' || event.key === 'Z') {
        setShowHidden(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Load base types data from CSV
  useEffect(() => {
    const loadBaseTypesData = async () => {
      try {
        const response = await fetch('/data/BaseTypes.csv');
        if (!response.ok) {
          throw new Error('Failed to load base types data');
        }
        
        const csvContent = await response.text();
        const parsedData = parseBaseTypesCSV(csvContent);
        
        setBaseTypesData(parsedData);
        const classes = getUniqueClasses(parsedData);
        setAvailableClasses(classes);
        
        // Set initial base types for the default class
        if (parsedData.length > 0) {
          const initialBaseTypes = getBaseTypesForClass(parsedData, defaultCriteria.class);
          setAvailableBaseTypes(initialBaseTypes);
        }
      } catch (error) {
        console.error('Failed to load base types data:', error);
        toast({
          title: "Warning",
          description: "Failed to load item database. Using manual input.",
          variant: "destructive",
        });
      }
    };

    loadBaseTypesData();
  }, [toast]);


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

  // Handle class selection
  const handleClassSelect = (selectedClass: string) => {
    setCriteria(prev => ({ ...prev, class: selectedClass }));
    
    // Update available base types for the selected class
    const baseTypesForClass = getBaseTypesForClass(baseTypesData, selectedClass);
    setAvailableBaseTypes(baseTypesForClass);
    
    // Auto-select first base type
    if (baseTypesForClass.length > 0) {
      const firstBaseType = baseTypesForClass[0];
      setCriteria(prev => ({
        ...prev,
        baseType: firstBaseType.baseType,
      }));
    }

    // Update toggle defaults based on item class
    if (selectedClass === 'Stackable Currency') {
      setModifierToggles(prev => ({
        ...prev,
        rarity: false,
        quality: false,
        sockets: false,
        stackSize: true,
      }));
    } else if (['Amulets', 'Rings', 'Body Armours', 'Helmets', 'Gloves', 'Boots', 'Shields', 'Belts'].includes(selectedClass)) {
      // Gear items
      setModifierToggles(prev => ({
        ...prev,
        rarity: true,
        quality: false,
        sockets: false,
        stackSize: false,
      }));
    } else {
      // Default for other items
      setModifierToggles(prev => ({
        ...prev,
        rarity: true,
        stackSize: false,
      }));
    }
  };

  // Handle base type selection
  const handleBaseTypeSelect = (selectedBaseType: string) => {
    setCriteria(prev => ({ ...prev, baseType: selectedBaseType }));
  };

  const generateItem = () => {
    setLoading(true);
    
    // Create filter context - only include enabled modifiers
    const filterContext: FilterContext = {
      baseType: criteria.baseType,
      itemClass: criteria.class,
      // Only include properties when their modifiers are enabled
      rarity: modifierToggles.rarity ? criteria.rarity : undefined,
      itemLevel: modifierToggles.itemLevel ? criteria.itemLevel : undefined,
      areaLevel: modifierToggles.areaLevel ? criteria.areaLevel : undefined,
      dropLevel: modifierToggles.dropLevel ? criteria.dropLevel : undefined,
      quality: modifierToggles.quality ? criteria.quality : undefined,
      sockets: modifierToggles.sockets ? criteria.sockets : undefined,
      stackSize: modifierToggles.stackSize ? criteria.stackSize : undefined,
    };

    // Get item styling from filter or use default
    let displayStyle;
    let isHidden = false;

    if (selectedFilterContent) {
      try {
        console.log('=== FILTER EVALUATION ===');
        console.log('Filter Context:', JSON.stringify(filterContext, null, 2));
        
        // Test with the actual filter format from the example file
        const realFormatTest = `Show # %D6 $type->gold $tier->stack3
	StackSize >= 5000
	BaseType == "Gold"
	SetFontSize 28
	SetTextColor 255 255 255 255

Show # $type->questlikeexception $tier->questitems
	Class == "Quest Items"
	SetFontSize 30
	SetTextColor 74 230 58 255

Show # %D4 $type->exoticbases $tier->commonexoticbases
	Rarity Normal Magic
	BaseType == "Breach Ring"
	SetFontSize 28
	SetTextColor 0 70 255 255`;
        
        console.log('\n=== TESTING REAL FILTER FORMAT ===');
        const testResult = getItemStyle(realFormatTest, filterContext);
        console.log('Real format test result:', JSON.stringify(testResult, null, 2));
        
        const filterResult = getItemStyle(selectedFilterContent, filterContext);
        console.log('\nUser Filter Result:', JSON.stringify(filterResult, null, 2));
        
        
        isHidden = filterResult.isHidden;
        displayStyle = {
          backgroundColor: filterResult.style.backgroundColor || "rgba(255, 255, 255, 0.1)",
          textColor: filterResult.style.textColor || "#c8c8c8",
          borderColor: filterResult.style.borderColor || "#666666",
          beamColor: filterResult.style.beam?.color,
          fontSize: filterResult.style.fontSize || 32,
        };
        console.log('Applied Display Style:', JSON.stringify(displayStyle, null, 2));
      } catch (error) {
        console.error('Filter parsing error:', error);
        displayStyle = getItemDisplayStyle(criteria, modifierToggles.rarity);
      }
    } else {
      displayStyle = getItemDisplayStyle(criteria, modifierToggles.rarity);
    }

    // Generate a unique item based on criteria
    const newItem: GeneratedItem = {
      id: Date.now().toString(),
      name: generateItemName(criteria),
      criteria: { ...criteria },
      modifierToggles: { ...modifierToggles },
      displayStyle,
      isHidden,
    };

    // Set the current item (visible or hidden)
    setCurrentItem(newItem);
    
    if (!isHidden) {
      toast({
        title: "Item Generated",
        description: `Generated ${newItem.name}`,
      });
    } else {
      toast({
        title: "Item Hidden",
        description: `${newItem.name} was filtered out by your loot filter (hold Alt to show)`,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const generateItemName = (criteria: ItemCriteria): string => {
    // Simply return the base type name
    return criteria.baseType;
  };

  const getItemDisplayStyle = (criteria: ItemCriteria, useRarity: boolean) => {
    // If rarity is disabled, use neutral styling
    if (!useRarity) {
      return {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        textColor: "#c8c8c8",
        borderColor: "#666666",
      };
    }

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
        };
      case "Rare":
        return {
          backgroundColor: "rgba(255, 255, 119, 0.2)",
          textColor: "#ffff77",
          borderColor: "#ffff77",
        };
      case "Unique":
        return {
          backgroundColor: "rgba(175, 96, 37, 0.3)",
          textColor: "#af6025",
          borderColor: "#af6025",
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


  return (
    <DefaultLayout>
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="space-y-6 overflow-x-hidden">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-white">Loot Drop Simulator</h1>
            <p className="text-zinc-400">
              Generate items and see how they would appear with your loot filter
            </p>
            
            {/* Testing Disclaimer */}
            <div className="flex justify-center mb-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                <div className="text-yellow-400 text-lg">⚠️</div>
                <div className="text-left">
                  <div className="text-yellow-300 text-sm font-medium">Testing Phase</div>
                  <div className="text-yellow-200 text-xs">
                    This simulator is under development and may not always be accurate
                  </div>
                </div>
              </div>
            </div>
            
            {baseTypesData.length > 0 && (
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-700 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-300 text-sm">
                    Using authentic PoE2 data ({baseTypesData.length} items)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
            {/* Controls Panel */}
            <Card className="p-6 bg-[#1a1a1a] border-[#2a2a2a] overflow-y-auto max-h-screen">
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
                    onChange={(e) => handleClassSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] text-white rounded-md"
                  >
                    {availableClasses.map((itemClass) => (
                      <option key={itemClass} value={itemClass}>
                        {itemClass}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Base Type */}
                <div className="space-y-2">
                  <Label className="text-zinc-300">Base Type</Label>
                  <select
                    value={criteria.baseType}
                    onChange={(e) => handleBaseTypeSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] text-white rounded-md"
                  >
                    {availableBaseTypes.map((baseType) => (
                      <option key={baseType.baseType} value={baseType.baseType}>
                        {baseType.baseType}
                      </option>
                    ))}
                  </select>
                  {availableBaseTypes.length === 0 && (
                    <p className="text-zinc-500 text-sm">No base types available for this class</p>
                  )}
                </div>

                {/* Modifier Toggles */}
                <div className="space-y-3">
                  <Label className="text-zinc-300 font-semibold">Filter Modifiers</Label>
                  <p className="text-xs text-zinc-500 mb-2">Enable/disable which properties are considered in filter matching</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="toggle-rarity"
                        checked={modifierToggles.rarity}
                        onChange={(e) => setModifierToggles(prev => ({ ...prev, rarity: e.target.checked }))}
                        className="w-4 h-4 text-[#922729] bg-[#2a2a2a] border-[#3a3a3a] rounded focus:ring-[#922729]"
                      />
                      <label htmlFor="toggle-rarity" className="text-sm text-zinc-300">Rarity</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="toggle-itemlevel"
                        checked={modifierToggles.itemLevel}
                        onChange={(e) => setModifierToggles(prev => ({ ...prev, itemLevel: e.target.checked }))}
                        className="w-4 h-4 text-[#922729] bg-[#2a2a2a] border-[#3a3a3a] rounded focus:ring-[#922729]"
                      />
                      <label htmlFor="toggle-itemlevel" className="text-sm text-zinc-300">Item Level</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="toggle-droplevel"
                        checked={modifierToggles.dropLevel}
                        onChange={(e) => setModifierToggles(prev => ({ ...prev, dropLevel: e.target.checked }))}
                        className="w-4 h-4 text-[#922729] bg-[#2a2a2a] border-[#3a3a3a] rounded focus:ring-[#922729]"
                      />
                      <label htmlFor="toggle-droplevel" className="text-sm text-zinc-300">Drop Level</label>
                    </div>
                    <div className="flex items-center space-x-2 bg-[#2a2a2a] p-2 rounded border border-[#4a4a4a]">
                      <input
                        type="checkbox"
                        id="toggle-arealevel"
                        checked={modifierToggles.areaLevel}
                        onChange={(e) => setModifierToggles(prev => ({ ...prev, areaLevel: e.target.checked }))}
                        className="w-4 h-4 text-[#922729] bg-[#2a2a2a] border-[#3a3a3a] rounded focus:ring-[#922729]"
                      />
                      <label htmlFor="toggle-arealevel" className="text-sm text-zinc-300">Area Level</label>
                      <span className="text-xs text-blue-400 ml-auto">Global</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="toggle-quality"
                        checked={modifierToggles.quality}
                        onChange={(e) => setModifierToggles(prev => ({ ...prev, quality: e.target.checked }))}
                        className="w-4 h-4 text-[#922729] bg-[#2a2a2a] border-[#3a3a3a] rounded focus:ring-[#922729]"
                      />
                      <label htmlFor="toggle-quality" className="text-sm text-zinc-300">Quality</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="toggle-sockets"
                        checked={modifierToggles.sockets}
                        onChange={(e) => setModifierToggles(prev => ({ ...prev, sockets: e.target.checked }))}
                        className="w-4 h-4 text-[#922729] bg-[#2a2a2a] border-[#3a3a3a] rounded focus:ring-[#922729]"
                      />
                      <label htmlFor="toggle-sockets" className="text-sm text-zinc-300">Sockets</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="toggle-stacksize"
                        checked={modifierToggles.stackSize}
                        onChange={(e) => setModifierToggles(prev => ({ ...prev, stackSize: e.target.checked }))}
                        className="w-4 h-4 text-[#922729] bg-[#2a2a2a] border-[#3a3a3a] rounded focus:ring-[#922729]"
                      />
                      <label htmlFor="toggle-stacksize" className="text-sm text-zinc-300">Stack Size</label>
                    </div>
                  </div>
                </div>

                {/* Rarity */}
                <div className="space-y-2">
                  <Label className={`text-zinc-300 ${!modifierToggles.rarity ? 'opacity-50' : ''}`}>Rarity</Label>
                  <select
                    value={criteria.rarity}
                    onChange={(e) => setCriteria(prev => ({ ...prev, rarity: e.target.value as 'Normal' | 'Magic' | 'Rare' | 'Unique' }))}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] text-white rounded-md"
                    disabled={!modifierToggles.rarity}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Magic">Magic</option>
                    <option value="Rare">Rare</option>
                    <option value="Unique">Unique</option>
                  </select>
                  {!modifierToggles.rarity && (
                    <p className="text-zinc-500 text-xs">Disabled - won&apos;t be used in filter matching</p>
                  )}
                </div>

                {/* Levels and Properties Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className={`text-zinc-300 ${!modifierToggles.itemLevel ? 'opacity-50' : ''}`}>
                      Item Level
                    </Label>
                    <Input
                      type="number"
                      value={criteria.itemLevel}
                      onChange={(e) => setCriteria(prev => ({ ...prev, itemLevel: parseInt(e.target.value) || 0 }))}
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
                      min="1"
                      max="100"
                      disabled={!modifierToggles.itemLevel}
                    />
                    {!modifierToggles.itemLevel && (
                      <p className="text-zinc-500 text-xs">Disabled - won&apos;t be used in filter matching</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className={`text-zinc-300 ${!modifierToggles.areaLevel ? 'opacity-50' : ''}`}>
                      Area Level
                    </Label>
                    <Input
                      type="number"
                      value={criteria.areaLevel}
                      onChange={(e) => setCriteria(prev => ({ ...prev, areaLevel: parseInt(e.target.value) || 0 }))}
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
                      min="1"
                      max="100"
                      disabled={!modifierToggles.areaLevel}
                    />
                    {!modifierToggles.areaLevel && (
                      <p className="text-zinc-500 text-xs">Disabled - won&apos;t be used in filter matching</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className={`text-zinc-300 ${!modifierToggles.dropLevel ? 'opacity-50' : ''}`}>
                      Drop Level
                    </Label>
                    <Input
                      type="number"
                      value={criteria.dropLevel}
                      onChange={(e) => setCriteria(prev => ({ ...prev, dropLevel: parseInt(e.target.value) || 0 }))}
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
                      min="1"
                      max="100"
                      disabled={!modifierToggles.dropLevel}
                    />
                    {!modifierToggles.dropLevel && (
                      <p className="text-zinc-500 text-xs">Disabled - won&apos;t be used in filter matching</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className={`text-zinc-300 ${!modifierToggles.quality ? 'opacity-50' : ''}`}>
                      Quality
                    </Label>
                    <Input
                      type="number"
                      value={criteria.quality}
                      onChange={(e) => setCriteria(prev => ({ ...prev, quality: parseInt(e.target.value) || 0 }))}
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
                      min="0"
                      max="20"
                      disabled={!modifierToggles.quality}
                    />
                    {!modifierToggles.quality && (
                      <p className="text-zinc-500 text-xs">Disabled - won&apos;t be used in filter matching</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className={`text-zinc-300 ${!modifierToggles.sockets ? 'opacity-50' : ''}`}>
                      Sockets
                    </Label>
                    <Input
                      type="number"
                      value={criteria.sockets}
                      onChange={(e) => setCriteria(prev => ({ ...prev, sockets: parseInt(e.target.value) || 0 }))}
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
                      min="0"
                      max="6"
                      disabled={!modifierToggles.sockets}
                    />
                    {!modifierToggles.sockets && (
                      <p className="text-zinc-500 text-xs">Disabled - won&apos;t be used in filter matching</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className={`text-zinc-300 ${!modifierToggles.stackSize ? 'opacity-50' : ''}`}>
                      Stack Size
                    </Label>
                    <Input
                      type="number"
                      value={criteria.stackSize}
                      onChange={(e) => setCriteria(prev => ({ ...prev, stackSize: parseInt(e.target.value) || 1 }))}
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
                      min="1"
                      disabled={!modifierToggles.stackSize}
                    />
                    {!modifierToggles.stackSize && (
                      <p className="text-zinc-500 text-xs">Disabled - won&apos;t be used in filter matching</p>
                    )}
                  </div>
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
            <Card className="p-6 bg-[#1a1a1a] border-[#2a2a2a] overflow-hidden">
              <h2 className="text-xl font-semibold text-white mb-4">Loot Preview</h2>
              
              {/* Game Background */}
              <div
                className="relative w-full h-[400px] rounded-lg overflow-hidden"
                style={{
                  backgroundImage: "url('/images/preview-bg.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: "#1a1410", // Fallback dark ground color
                }}
              >
                {/* Generated Item */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {!currentItem ? (
                    <p className="text-zinc-400 text-center bg-black/50 px-4 py-2 rounded">
                      Generate an item to see how it appears in-game
                    </p>
                  ) : currentItem.isHidden && !showHidden ? (
                    <div className="text-center bg-black/70 px-4 py-2 rounded border border-red-500">
                      <p className="text-red-400 font-medium mb-1">{currentItem.name}</p>
                      <p className="text-zinc-500 text-sm">Hidden by filter</p>
                      <p className="text-zinc-400 text-xs mt-1">Hold Z to show hidden items</p>
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-center">
                      {/* Vertical Beam Effect */}
                      {currentItem.displayStyle.beamColor && (
                        <>
                          {/* Main beam - extends from item upward */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              background: `linear-gradient(to bottom, ${currentItem.displayStyle.beamColor}80 0%, ${currentItem.displayStyle.beamColor}60 30%, ${currentItem.displayStyle.beamColor}40 70%, transparent 100%)`,
                              width: '6px',
                              height: '150px',
                              left: '50%',
                              top: '50%',
                              transform: 'translateX(-50%)',
                              borderRadius: '3px',
                              zIndex: 5
                            }}
                          />
                          {/* Beam glow - extends from item upward */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              background: `linear-gradient(to bottom, ${currentItem.displayStyle.beamColor}25 0%, ${currentItem.displayStyle.beamColor}15 40%, ${currentItem.displayStyle.beamColor}10 80%, transparent 100%)`,
                              width: '16px',
                              height: '150px',
                              left: '50%',
                              top: '50%',
                              transform: 'translateX(-50%)',
                              borderRadius: '8px',
                              zIndex: 4
                            }}
                          />
                        </>
                      )}
                      
                      {/* Item Text */}
                      <div
                        className={`relative px-4 py-2 rounded border-2 font-medium ${currentItem.isHidden ? 'opacity-60' : ''}`}
                        style={{
                          backgroundColor: currentItem.displayStyle.backgroundColor,
                          color: currentItem.displayStyle.textColor,
                          borderColor: currentItem.displayStyle.borderColor,
                          fontSize: Math.max(16, Math.min(32, (currentItem.displayStyle.fontSize || 32) / 1.5)),
                          boxShadow: "0 2px 8px rgba(0,0,0,0.7)", // Stronger shadow for better contrast
                          textShadow: "1px 1px 3px rgba(0,0,0,0.9)", // Stronger text shadow for readability
                          zIndex: 10
                        }}
                      >
                        {currentItem.name}
                      </div>
                    </div>
                  )}
                </div>
              </div>


              {/* Current Item Properties */}
              {criteria && (
                <div className="mt-4 p-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">Filter Matching Properties</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-zinc-400">Class: <span className="text-white">{criteria.class}</span></div>
                    <div className="text-zinc-400">BaseType: <span className="text-white">{criteria.baseType}</span></div>
                    {modifierToggles.rarity && (
                      <div className="text-zinc-400">Rarity: <span className="text-white">{criteria.rarity}</span></div>
                    )}
                    {modifierToggles.areaLevel && (
                      <div className="text-zinc-400">AreaLevel: <span className="text-white">{criteria.areaLevel}</span> <span className="text-blue-400 text-xs">(Global)</span></div>
                    )}
                    {modifierToggles.itemLevel && (
                      <div className="text-zinc-400">ItemLevel: <span className="text-white">{criteria.itemLevel}</span></div>
                    )}
                    {modifierToggles.dropLevel && (
                      <div className="text-zinc-400">DropLevel: <span className="text-white">{criteria.dropLevel}</span></div>
                    )}
                    {modifierToggles.quality && (
                      <div className="text-zinc-400">Quality: <span className="text-white">{criteria.quality}</span></div>
                    )}
                    {modifierToggles.sockets && (
                      <div className="text-zinc-400">Sockets: <span className="text-white">{criteria.sockets}</span></div>
                    )}
                    {modifierToggles.stackSize && (
                      <div className="text-zinc-400">StackSize: <span className="text-white">{criteria.stackSize}</span></div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">
                    Only enabled properties are sent to the filter parser. Area Level is the global scenario condition.
                  </div>
                  {currentItem?.isHidden && (
                    <div className="mt-2 p-2 bg-red-900/20 border border-red-800 rounded text-xs">
                      <div className="text-red-400 font-medium">Item Hidden by Filter</div>
                      <div className="text-zinc-400">Press and hold Z key to reveal hidden items</div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}