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
    <div className="w-full md:w-96 flex flex-col bg-[#1a1a1a] border-l border-[#2a2a2a] overflow-hidden">
      <div className="shrink-0 p-4 md:p-6 space-y-4 md:space-y-6 border-b border-[#2a2a2a] bg-[#1a1a1a] overflow-y-auto max-h-[calc(100vh-6rem)]">
        <h2 className="text-lg font-medium text-white sticky top-0 bg-[#1a1a1a] py-2 z-10">
          Item Preview
        </h2>

        <div className="space-y-4">
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
      </div>

      <div className="flex-1 p-4 overflow-y-auto min-h-[300px]">
        <Card className="h-full bg-[#1f1f1f] border-[#2a2a2a]">
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
  );
};
