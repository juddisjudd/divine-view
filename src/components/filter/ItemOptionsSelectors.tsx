import React from "react";
import { SelectField } from "@/components/ui/SelectField";
import { RaritySelector } from "@/components/filter/RaritySelector";
import type { ItemOptions } from "@/types/filter";

interface ItemOptionsSelectorsProps {
  itemOptions?: ItemOptions;
  selectedRarity: string;
  areaLevel?: number;
  itemLevel?: number;
  quality?: number;
  stackSize?: number;
  isStackable: boolean;
  onRarityChange: (value: string) => void;
  onAreaLevelChange: (value: string) => void;
  onItemLevelChange: (value: string) => void;
  onQualityChange: (value: string) => void;
  onStackSizeChange: (value: string) => void;
}

export const ItemOptionsSelectors: React.FC<ItemOptionsSelectorsProps> = ({
  itemOptions,
  selectedRarity,
  areaLevel,
  itemLevel,
  quality,
  stackSize,
  isStackable,
  onRarityChange,
  onAreaLevelChange,
  onItemLevelChange,
  onQualityChange,
  onStackSizeChange,
}) => {
  const levelOptions = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((level) => ({
    value: String(level),
    label: `Level ${level}`,
  }));

  const qualityOptions = [0, 5, 10, 15, 20].map((q) => ({
    value: String(q),
    label: `${q}%`,
  }));

  const stackSizeOptions = [
    1, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000,
  ].map((size) => ({
    value: String(size),
    label: size.toLocaleString(),
  }));

  return (
    <div className="space-y-4">
      {itemOptions?.rarity && (
        <RaritySelector
          value={selectedRarity}
          onChange={onRarityChange}
          options={itemOptions}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {itemOptions?.areaLevel && (
          <SelectField
            label="Area Level"
            value={areaLevel !== undefined ? String(areaLevel) : ""}
            placeholder="Select area level"
            options={levelOptions}
            onChange={onAreaLevelChange}
          />
        )}

        {itemOptions?.itemLevel && (
          <SelectField
            label="Item Level"
            value={itemLevel !== undefined ? String(itemLevel) : ""}
            placeholder="Select item level"
            options={levelOptions}
            onChange={onItemLevelChange}
          />
        )}
      </div>

      {isStackable && (
        <SelectField
          label="Stack Size"
          value={String(stackSize)}
          placeholder="Select stack size"
          options={stackSizeOptions}
          onChange={onStackSizeChange}
        />
      )}

      {itemOptions?.quality && (
        <SelectField
          label="Quality"
          value={quality !== undefined ? String(quality) : ""}
          placeholder="Select quality"
          options={qualityOptions}
          onChange={onQualityChange}
        />
      )}
    </div>
  );
};
