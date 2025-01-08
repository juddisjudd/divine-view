import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ItemOptions } from "@/types/filter";

interface RaritySelectorProps {
  value: string;
  onChange: (value: string) => void;
  options?: ItemOptions;
  disabled?: boolean;
}

export const RaritySelector: React.FC<RaritySelectorProps> = ({
  value,
  onChange,
  options,
  disabled = false,
}) => {
  if (!options?.rarity) return null;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-400">Rarity</label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full bg-[#2a2a2a] border-[#3a3a3a] text-gray-200">
          <SelectValue placeholder="Select rarity" />
        </SelectTrigger>
        <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a]">
          {options.rarity.map((rarity) => (
            <SelectItem key={rarity} value={rarity} className="text-gray-200">
              {rarity}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
