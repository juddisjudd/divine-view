import { useState, useMemo } from 'react';
import { itemData } from "@/data/item-data";

export function useItemSelection() {
  const [selectedItemType, setSelectedItemType] = useState<string>('');
  const [selectedBaseType, setSelectedBaseType] = useState<string>('');

  const itemTypes = useMemo(() => [...new Set(itemData.map((item) => item.itemType))], []);

  const baseTypes = useMemo(() => {
    const item = itemData.find((i) => i.itemType === selectedItemType);
    return item ? item.baseTypes : [];
  }, [selectedItemType]);

  const handleItemTypeChange = (value: string) => {
    setSelectedItemType(value);
    setSelectedBaseType('');
  };

  return {
    selectedItemType,
    selectedBaseType,
    itemTypes,
    baseTypes,
    handleItemTypeChange,
    setSelectedBaseType,
  };
}

