import React from "react";
import { Card } from "@/components/ui/card";
import { ItemSelector } from "@/components/filter/ItemSelector";
import { ItemPreview } from "@/components/filter/ItemPreview";
import { ItemOptionsSelectors } from "@/components/filter/ItemOptionsSelectors";
import type { ItemOptions } from "@/types/filter";

interface ItemPreviewPanelProps {
  selectedItemType: string;
  selectedBaseType: string;
  currentItemClass: string;
  itemOptions?: ItemOptions;
  areaLevel?: number;
  itemLevel?: number;
  selectedRarity: string;
  stackSize?: number;
  quality?: number;
  filterContent: string;
  isStackable: boolean;
  onItemTypeChange: (value: string) => void;
  onBaseTypeChange: (value: string) => void;
  onRarityChange: (value: string) => void;
  onAreaLevelChange: (value: string) => void;
  onItemLevelChange: (value: string) => void;
  onQualityChange: (value: string) => void;
  onStackSizeChange: (value: string) => void;
}

export const ItemPreviewPanel: React.FC<ItemPreviewPanelProps> = ({
  selectedItemType,
  selectedBaseType,
  currentItemClass,
  itemOptions,
  areaLevel,
  itemLevel,
  selectedRarity,
  stackSize,
  quality,
  filterContent,
  isStackable,
  onItemTypeChange,
  onBaseTypeChange,
  onRarityChange,
  onAreaLevelChange,
  onItemLevelChange,
  onQualityChange,
  onStackSizeChange,
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-[#1a1a1a] border-l border-[#2a2a2a] overflow-hidden z-20 relative">
      {/* Temporarily disabled - will be rewritten */}
      <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-30">
        <span className="text-white text-base px-4 text-center">
          Currently unavailable due to being rewritten
        </span>
      </div>

      <div className="p-2 sm:p-4 border-b border-[#2a2a2a] bg-[#1a1a1a]">
        <h2 className="text-lg font-medium text-white">Item Preview</h2>
      </div>

      {/* Make the layout more fluid for small screens */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-2 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto">
          <ItemSelector
            selectedItemType={selectedItemType}
            selectedBaseType={selectedBaseType}
            onItemTypeChange={onItemTypeChange}
            onBaseTypeChange={onBaseTypeChange}
          />

          <ItemOptionsSelectors
            itemOptions={itemOptions}
            selectedRarity={selectedRarity}
            areaLevel={areaLevel}
            itemLevel={itemLevel}
            quality={quality}
            stackSize={stackSize}
            isStackable={isStackable}
            onRarityChange={onRarityChange}
            onAreaLevelChange={onAreaLevelChange}
            onItemLevelChange={onItemLevelChange}
            onQualityChange={onQualityChange}
            onStackSizeChange={onStackSizeChange}
          />
        </div>

        <div className="flex-1 min-h-[200px] sm:min-h-[300px] p-2 sm:p-4 overflow-hidden">
          <Card className="h-full bg-[#1f1f1f] border-[#2a2a2a] flex items-center justify-center">
            <ItemPreview
              filterContent={filterContent}
              itemName={selectedBaseType}
              itemClass={currentItemClass}
              itemOptions={itemOptions}
              areaLevel={areaLevel}
              itemLevel={itemLevel}
              stackSize={stackSize}
              rarity={selectedRarity}
              quality={quality}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
