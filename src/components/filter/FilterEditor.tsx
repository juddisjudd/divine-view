"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import Header from "@/components/filter/Header";
import { Footer } from "@/components/filter/Footer";
import { FileImport } from "@/components/filter/FileImport";
import { ItemSelector } from "@/components/filter/ItemSelector";
import { ItemPreview } from "@/components/filter/ItemPreview";
import { RaritySelector } from "@/components/filter/RaritySelector";
import { FilterEditorSyntax } from "@/components/filter/FilterEditorSyntax";
import { validateFilter } from "@/utils/filterValidator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { itemData } from "@/data/item-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ValidationMessage {
  line: number;
  message: string;
  severity: "error" | "warning";
}

const RARITY_RESTRICTED_CLASSES = [
  "Stackable Currency",
  "Currency",
  "Distilled Emotions",
  "Essences",
  "Catalysts",
  "Charms",
  "Relics",
];

const QUALITY_RESTRICTED_CLASSES = [
  "Stackable Currency",
  "Currency",
  "Distilled Emotions",
  "Essences",
  "Catalysts",
  "Charms",
  "Relics",
];

import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

export const FilterEditor: React.FC = () => {
  const { toast } = useToast();
  const [filterContent, setFilterContent] = useState<string>("");

  useEffect(() => {
    toast({
      variant: "destructive",
      title: "🚧 Development Build",
      description:
        "Under active development. You will encounter bugs and incomplete features.",
      action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
      duration: 10000,
    });
  }, [toast]);
  const [selectedItemType, setSelectedItemType] = useState<string>("");
  const [selectedBaseType, setSelectedBaseType] = useState<string>("");
  const [selectedRarity, setSelectedRarity] = useState<string>("");
  const [itemLevel, setItemLevel] = useState<number | undefined>(undefined);
  const [rarity, setRarity] = useState<string | undefined>(undefined);
  const [stackSize, setStackSize] = useState<number | undefined>(undefined);
  const [areaLevel, setAreaLevel] = useState<number | undefined>(undefined);
  const [quality, setQuality] = useState<number | undefined>(undefined);
  const [validationMessages, setValidationMessages] = useState<
    ValidationMessage[]
  >([]);
  const [showValidation, setShowValidation] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
    return (
      currentItemClass === "Stackable Currency" && selectedBaseType === "Gold"
    );
  }, [currentItemClass, selectedBaseType]);

  const hasRestrictedRarity = useMemo(() => {
    return RARITY_RESTRICTED_CLASSES.includes(currentItemClass);
  }, [currentItemClass]);

  const hasRestrictedQuality = useMemo(() => {
    return QUALITY_RESTRICTED_CLASSES.includes(currentItemClass);
  }, [currentItemClass]);

  useEffect(() => {
    if (!isStackable) {
      setStackSize(1);
    }
  }, [isStackable]);

  useEffect(() => {
    if (hasRestrictedRarity) {
      setSelectedRarity("Normal");
    }
  }, [hasRestrictedRarity]);

  useEffect(() => {
    if (hasRestrictedQuality) {
      setQuality(undefined);
    }
  }, [hasRestrictedQuality]);

  useEffect(() => {
    if (selectedBaseType) {
      console.log("Selected base type:", selectedBaseType);
    }
  }, [selectedBaseType]);

  const handleItemTypeChange = (value: string) => {
    setSelectedItemType(value);
    setSelectedBaseType("");
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
    <div className="flex flex-col h-screen bg-[#121212]">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Filter Editor */}
        <div
          className={`flex-1 flex flex-col min-w-0 ${
            !showPreview ? "w-full" : "md:w-[60%]"
          }`}
        >
          <FileImport onImport={setFilterContent} content={filterContent} />
          <div className="flex-1 p-4">
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
          <div className="w-full md:w-96 flex-col bg-[#1a1a1a] overflow-y-auto">
            <div className="p-4 md:p-6 space-y-4 md:space-y-6 border-b border-[#2a2a2a]">
              <h2 className="text-lg font-medium text-white">Item Preview</h2>

              <ItemSelector
                selectedItemType={selectedItemType}
                selectedBaseType={selectedBaseType}
                onItemTypeChange={handleItemTypeChange}
                onBaseTypeChange={handleBaseTypeChange}
              />

              {!hasRestrictedRarity && (
                <RaritySelector
                  value={selectedRarity}
                  onChange={setSelectedRarity}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-400">
                    Area Level
                  </label>
                  <Select
                    value={areaLevel !== undefined ? String(areaLevel) : ""}
                    onValueChange={(value) =>
                      setAreaLevel(value ? Number(value) : undefined)
                    }
                  >
                    <SelectTrigger className="w-full bg-[#2a2a2a] border-[#3a3a3a] text-gray-200 h-9">
                      <SelectValue placeholder="Select area level" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a]">
                      {[1, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((level) => (
                        <SelectItem
                          key={level}
                          value={String(level)}
                          className="text-gray-200"
                        >
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-400">
                    Item Level
                  </label>
                  <Select
                    value={itemLevel !== undefined ? String(itemLevel) : ""}
                    onValueChange={(value) =>
                      setItemLevel(value ? Number(value) : undefined)
                    }
                  >
                    <SelectTrigger className="w-full bg-[#2a2a2a] border-[#3a3a3a] text-gray-200 h-9">
                      <SelectValue placeholder="Select item level" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a]">
                      {[1, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((level) => (
                        <SelectItem
                          key={level}
                          value={String(level)}
                          className="text-gray-200"
                        >
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isStackable && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-400">
                    Stack Size
                  </label>
                  <Select
                    value={String(stackSize)}
                    onValueChange={(value) => setStackSize(Number(value))}
                  >
                    <SelectTrigger className="w-full bg-[#2a2a2a] border-[#3a3a3a] text-gray-200 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a]">
                      {[
                        1, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000,
                      ].map((size) => (
                        <SelectItem
                          key={size}
                          value={String(size)}
                          className="text-gray-200"
                        >
                          {size.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!hasRestrictedQuality && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-400">
                    Quality
                  </label>
                  <Select
                    value={quality !== undefined ? String(quality) : ""}
                    onValueChange={(value) =>
                      setQuality(value ? Number(value) : undefined)
                    }
                  >
                    <SelectTrigger className="w-full bg-[#2a2a2a] border-[#3a3a3a] text-gray-200 h-9">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2a2a2a] border-[#3a3a3a]">
                      {[0, 5, 10, 15, 20].map((q) => (
                        <SelectItem
                          key={q}
                          value={String(q)}
                          className="text-gray-200"
                        >
                          {q}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex-1 p-4">
              <Card className="h-full bg-[#1f1f1f] border-[#2a2a2a]">
                <div className="h-full">
                  <ItemPreview
                    filterContent={filterContent}
                    itemName={selectedBaseType}
                    itemClass={currentItemClass}
                    areaLevel={areaLevel}
                    itemLevel={itemLevel}
                    stackSize={stackSize}
                    rarity={selectedRarity}
                    quality={quality}
                  />
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Validation Messages Panel */}
      {showValidation && validationMessages.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#2a2a2a] shadow-lg z-50">
          <div className="max-w-screen-2xl mx-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-white font-medium">
                    {validationMessages.length}{" "}
                    {validationMessages.length === 1 ? "issue" : "issues"} found
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowValidation(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {validationMessages.map((message, index) => (
                  <Alert
                    key={index}
                    variant={
                      message.severity === "error" ? "destructive" : "default"
                    }
                    className="bg-[#2a2a2a] border-[#3a3a3a] py-2"
                  >
                    <AlertDescription className="flex items-start gap-2">
                      <span className="text-xs font-medium text-gray-400 shrink-0">
                        Line {message.line}:
                      </span>
                      <span className="text-sm text-gray-200">
                        {message.message}
                      </span>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default FilterEditor;
