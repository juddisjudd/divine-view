"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { FileImport } from "@/components/filter/FileImport";
import { FilterEditorSyntax } from "@/components/filter/FilterEditorSyntax";
import { ValidationPanel } from "@/components/filter/ValidationPanel";
import { ItemPreviewPanel } from "@/components/filter/ItemPreviewPanel";
import { itemData } from "@/data/item-data";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ItemOptions, ValidationMessage } from "@/types/filter";

export const FilterEditor: React.FC = () => {
  const { toast } = useToast();
  const [filterContent, setFilterContent] = useState<string>("");
  const [validationMessages, setValidationMessages] = useState<
    ValidationMessage[]
  >([]);
  const [showValidation, setShowValidation] = useState<boolean>(true);

  const [selectedItemType, setSelectedItemType] = useState<string>("");
  const [selectedBaseType, setSelectedBaseType] = useState<string>("");
  const [itemOptions, setItemOptions] = useState<ItemOptions | undefined>(
    undefined
  );

  const [selectedRarity, setSelectedRarity] = useState<string>("");
  const [itemLevel, setItemLevel] = useState<number | undefined>(undefined);
  const [areaLevel, setAreaLevel] = useState<number | undefined>(undefined);
  const [quality, setQuality] = useState<number | undefined>(undefined);
  const [stackSize, setStackSize] = useState<number | undefined>(undefined);

  const [showPreview, setShowPreview] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkImportedFilter = async () => {
      const importedFilter = localStorage.getItem("importedFilter");
      const importedFilterName = localStorage.getItem("importedFilterName");

      if (importedFilter) {
        setFilterContent(importedFilter);

        localStorage.removeItem("importedFilter");
        localStorage.removeItem("importedFilterName");

        toast({
          title: "Filter Imported",
          description: `Successfully imported ${
            importedFilterName || "filter"
          }`,
        });
      }
    };

    checkImportedFilter();
  }, [toast]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setShowPreview(window.innerWidth >= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const currentItemClass = useMemo(() => {
    if (!selectedItemType) return "";
    return (
      itemData.find((i) => i.itemType === selectedItemType)?.itemClass || ""
    );
  }, [selectedItemType]);

  const isStackable = useMemo(() => {
    return Boolean(itemOptions?.stackable && selectedBaseType === "Gold");
  }, [itemOptions, selectedBaseType]);

  useEffect(() => {
    if (!isStackable) {
      setStackSize(1);
    }
  }, [isStackable]);

  useEffect(() => {
    if (!itemOptions?.rarity) {
      setSelectedRarity("Normal");
    }
  }, [itemOptions]);

  useEffect(() => {
    if (!itemOptions?.quality) {
      setQuality(undefined);
    }
  }, [itemOptions]);

  const handleItemTypeChange = (value: string) => {
    const selectedItem = itemData.find((i) => i.itemType === value);
    setSelectedItemType(value);
    setSelectedBaseType("");
    const options = selectedItem?.options;
    if (options && typeof options.rarity === "boolean") {
      setItemOptions({ ...options, rarity: options.rarity ? [] : false });
    } else {
      setItemOptions(options);
    }
  };

  const handleBaseTypeChange = (value: string) => {
    setSelectedBaseType(value);
    setAreaLevel(undefined);
    setItemLevel(undefined);
    setQuality(undefined);
    setSelectedRarity("Normal");
    setStackSize(1);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Filter Editor */}
        <div
          className={`flex-1 flex flex-col min-w-0 ${
            !showPreview ? "w-full" : "md:w-[60%]"
          }`}
        >
          <FileImport onImport={setFilterContent} content={filterContent} />
          <div className="flex-1 p-4 overflow-hidden">
            <Card className="h-full bg-[#1a1a1a] border-[#2a2a2a]">
              <FilterEditorSyntax
                value={filterContent}
                onChange={setFilterContent}
              />
            </Card>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        {isMobile && (
          <button
            className="fixed bottom-4 right-4 z-50 bg-[#2a2a2a] p-2 rounded-full shadow-lg"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <ChevronRight className="h-6 w-6" />
            ) : (
              <ChevronLeft className="h-6 w-6" />
            )}
          </button>
        )}

        {/* Right Panel - Item Preview */}
        {showPreview && (
          <ItemPreviewPanel
            selectedItemType={selectedItemType}
            selectedBaseType={selectedBaseType}
            currentItemClass={currentItemClass}
            itemOptions={itemOptions}
            areaLevel={areaLevel}
            itemLevel={itemLevel}
            selectedRarity={selectedRarity}
            stackSize={stackSize}
            quality={quality}
            filterContent={filterContent}
            isStackable={isStackable}
            onItemTypeChange={handleItemTypeChange}
            onBaseTypeChange={handleBaseTypeChange}
            onRarityChange={setSelectedRarity}
            onAreaLevelChange={(value) =>
              setAreaLevel(value ? Number(value) : undefined)
            }
            onItemLevelChange={(value) =>
              setItemLevel(value ? Number(value) : undefined)
            }
            onQualityChange={(value) =>
              setQuality(value ? Number(value) : undefined)
            }
            onStackSizeChange={(value) => setStackSize(Number(value))}
          />
        )}
      </div>

      {/* Validation Messages Panel */}
      <ValidationPanel
        messages={validationMessages}
        onClose={() => setShowValidation(false)}
      />
    </div>
  );
};

export default FilterEditor;
