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
    const checkResponsiveness = () => {
      const width = window.innerWidth;
      const isMobileView = width < 640;
      const isTabletView = width >= 640 && width < 1024;

      setIsMobile(isMobileView);
      setShowPreview(!isMobileView);
    };

    checkResponsiveness();
    window.addEventListener("resize", checkResponsiveness);
    return () => window.removeEventListener("resize", checkResponsiveness);
  }, []);

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Mobile header with preview toggle */}
      <div className="flex items-center justify-between border-[#2a2a2a] bg-[#131313] p-2 md:hidden">
        <h2 className="text-sm font-medium text-white">
          Divine View Filter Editor
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="text-gray-300 hover:text-white bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a]"
          onClick={togglePreviewPanel}
        >
          {showPreview ? (
            <ChevronRight className="h-4 w-4 mr-1" />
          ) : (
            <ChevronLeft className="h-4 w-4 mr-1" />
          )}
          {showPreview ? "Hide Preview" : "Show Preview"}
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left Panel - Filter Editor or Syntax Guide */}
        <div
          className={`flex-1 flex flex-col min-w-0 ${
            showPreview ? "h-1/2 md:h-auto md:w-[60%]" : "h-full w-full"
          }`}
        >
          <FileImport
            onImport={setFilterContent}
            content={filterContent}
            showSyntaxGuide={showSyntaxGuide}
            setShowSyntaxGuide={setShowSyntaxGuide}
          />
          <div className="flex-1 p-2 md:p-4 overflow-hidden">
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
          <div
            className={`${
              isMobile ? "h-1/2" : "flex-1"
            } md:w-96 md:flex-none flex flex-col bg-[#1a1a1a] border-t md:border-t-0 md:border-l border-[#2a2a2a] overflow-hidden z-20 relative`}
          >
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
          </div>
        )}

        {/* Better positioned mobile toggle button */}
        <button
          className="fixed bottom-4 right-4 z-10 md:hidden bg-[#2a2a2a] p-3 rounded-full shadow-lg"
          onClick={togglePreviewPanel}
          aria-label={showPreview ? "Hide preview panel" : "Show preview panel"}
        >
          {showPreview ? (
            <ChevronRight className="h-6 w-6 text-white" />
          ) : (
            <ChevronLeft className="h-6 w-6 text-white" />
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
