import React, { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { itemData } from "@/data/item-data";
import type { ItemOptions } from "@/types/filter";

interface ItemSelectorProps {
  selectedItemType: string;
  selectedBaseType: string;
  onItemTypeChange: (value: string) => void;
  onBaseTypeChange: (value: string) => void;
  onOptionsChange?: (options: ItemOptions | undefined) => void;
  onItemClassChange?: (itemClass: string) => void;
}

export const ItemSelector: React.FC<ItemSelectorProps> = ({
  selectedItemType,
  selectedBaseType,
  onItemTypeChange,
  onBaseTypeChange,
  onOptionsChange,
  onItemClassChange,
}) => {
  const itemTypes = useMemo(
    () => [...new Set(itemData.map((item) => item.itemType))],
    []
  );

  const selectedItem = useMemo(
    () => itemData.find((i) => i.itemType === selectedItemType),
    [selectedItemType]
  );

  const handleItemTypeChange = (value: string) => {
    const newSelectedItem = itemData.find((i) => i.itemType === value);
    onItemTypeChange(value);
    if (newSelectedItem) {
      const options: ItemOptions = {
        ...newSelectedItem.options,
        rarity: Array.isArray(newSelectedItem.options.rarity)
          ? newSelectedItem.options.rarity
          : false,
      };
      onOptionsChange?.(options);
      onItemClassChange?.(newSelectedItem.itemClass);
    }
  };

  return (
    <div className="space-y-2">
      <Select value={selectedItemType} onValueChange={handleItemTypeChange}>
        <SelectTrigger className="w-full bg-[#2a2a2a] border-[#3a3a3a] text-gray-200">
          <SelectValue
            placeholder="Select item type"
            className="text-gray-400"
          />
        </SelectTrigger>
        <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a]">
          {itemTypes.map((type) => (
            <SelectItem key={type} value={type} className="text-gray-200">
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedBaseType}
        onValueChange={onBaseTypeChange}
        disabled={!selectedItemType}
      >
        <SelectTrigger className="w-full bg-[#2a2a2a] border-[#3a3a3a] text-gray-200">
          <SelectValue
            placeholder={
              selectedItemType ? "Select base type" : "Choose item type first"
            }
            className="text-gray-400"
          />
        </SelectTrigger>
        <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a]">
          {selectedItem?.baseTypes.map((type) => (
            <SelectItem key={type} value={type} className="text-gray-200">
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ItemSelector;
