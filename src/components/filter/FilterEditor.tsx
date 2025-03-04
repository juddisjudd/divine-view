"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { FileImport } from "@/components/filter/FileImport";
import { FilterEditorSyntax } from "@/components/filter/FilterEditorSyntax";
import { ValidationPanel } from "@/components/filter/ValidationPanel";
import { ItemPreviewPanel } from "@/components/filter/ItemPreviewPanel";
import SyntaxGuide from "@/components/filter/SyntaxGuide";
import { itemData } from "@/data/item-data";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
  const [showSyntaxGuide, setShowSyntaxGuide] = useState(false);

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
    if (!isStackable && stackSize === undefined) {
      setStackSize(1);
    }
  }, [isStackable, stackSize]);

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

  const togglePreviewPanel = () => {
    setShowPreview(!showPreview);
  };

  const toggleSyntaxGuide = () => {
    setShowSyntaxGuide(!showSyntaxGuide);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b border-[#2a2a2a] bg-[#131313]">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className={`text-gray-300 hover:text-white bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a] ${
              !showSyntaxGuide ? "bg-[#3a3a3a]" : ""
            }`}
            onClick={() => setShowSyntaxGuide(false)}
          >
            Editor
          </Button>
          <Button
            variant="outline"
            className={`text-gray-300 hover:text-white bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a] ${
              showSyntaxGuide ? "bg-[#3a3a3a]" : ""
            }`}
            onClick={() => setShowSyntaxGuide(true)}
          >
            Syntax Guide
          </Button>
        </div>
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="md:hidden text-gray-300 hover:text-white bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a]"
            onClick={togglePreviewPanel}
          >
            {showPreview ? <ChevronRight /> : <ChevronLeft />}
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Filter Editor or Syntax Guide */}
        <div
          className={`flex-1 flex flex-col min-w-0 ${
            !showPreview ? "w-full" : "md:w-[60%]"
          }`}
        >
          <FileImport onImport={setFilterContent} content={filterContent} />
          <div className="flex-1 p-4 overflow-hidden">
            <Card className="h-full bg-[#1a1a1a] border-[#2a2a2a]">
              {showSyntaxGuide ? (
                <SyntaxGuide />
              ) : (
                <FilterEditorSyntax
                  value={filterContent}
                  onChange={setFilterContent}
                />
              )}
            </Card>
          </div>
        </div>

        {/* Collapse/Expand Button for desktop */}
        <div className="hidden md:flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-6 bg-[#2a2a2a] rounded-none rounded-l p-0 border-y border-l border-[#3a3a3a] text-gray-400"
            onClick={togglePreviewPanel}
          >
            {showPreview ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>

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

        {/* Mobile Toggle Button */}
        <button
          className="fixed bottom-4 right-4 z-10 md:hidden bg-[#2a2a2a] p-2 rounded-full shadow-lg"
          onClick={togglePreviewPanel}
        >
          {showPreview ? (
            <ChevronRight className="h-6 w-6" />
          ) : (
            <ChevronLeft className="h-6 w-6" />
          )}
        </button>
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
