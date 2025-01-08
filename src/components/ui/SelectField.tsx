import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  placeholder,
  options,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-400">{label}</label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full bg-[#2a2a2a] border-[#3a3a3a] text-gray-200 h-9">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a] z-50">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-gray-200"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
