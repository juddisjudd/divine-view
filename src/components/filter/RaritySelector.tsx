import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RaritySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const RaritySelector: React.FC<RaritySelectorProps> = ({
  value,
  onChange,
}) => {
  const rarities = ["Normal", "Magic", "Rare", "Unique"] as const;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-400">Rarity</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-[#2a2a2a] border-[#3a3a3a] text-gray-200">
          <SelectValue placeholder="Select rarity" />
        </SelectTrigger>
        <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a]">
          {rarities.map((rarity) => (
            <SelectItem key={rarity} value={rarity} className="text-gray-200">
              {rarity}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
