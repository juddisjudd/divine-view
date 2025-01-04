import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { itemData } from "@/data/item-data";

interface ItemSelectorProps {
  selectedItemType: string;
  selectedBaseType: string;
  onItemTypeChange: (value: string) => void;
  onBaseTypeChange: (value: string) => void;
}

export const ItemSelector: React.FC<ItemSelectorProps> = ({
  selectedItemType,
  selectedBaseType,
  onItemTypeChange,
  onBaseTypeChange,
}) => {
  const itemTypes = [...new Set(itemData.map((item) => item.itemType))];

  const getBaseTypes = (itemType: string) => {
    const item = itemData.find((i) => i.itemType === itemType);
    return item ? item.baseTypes : [];
  };

  return (
    <div className="space-y-2">
      <Select value={selectedItemType} onValueChange={onItemTypeChange}>
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
          {getBaseTypes(selectedItemType).map((type) => (
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
