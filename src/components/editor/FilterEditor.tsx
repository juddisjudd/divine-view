"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FileImport } from "@/components/editor/FileImport";
import { FilterEditorSyntax } from "@/components/editor/FilterEditorSyntax";
import { ValidationPanel } from "@/components/editor/ValidationPanel";
import SyntaxGuide from "@/components/editor/SyntaxGuide";
import { useToast } from "@/hooks/use-toast";
import type { ValidationMessage } from "@/types/filter";

export const FilterEditor: React.FC = () => {
  const { toast } = useToast();
  const [filterContent, setFilterContent] = useState<string>("");
  const [validationMessages, setValidationMessages] = useState<
    ValidationMessage[]
  >([]);
  const [showValidation, setShowValidation] = useState<boolean>(true);
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


  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Full Width Filter Editor */}
        <div className="flex-1 flex flex-col min-w-0">
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
