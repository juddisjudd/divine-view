"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { FileImport } from "@/components/editor/FileImport";
import { FilterEditorSyntax, type FilterEditorSyntaxHandle } from "@/components/editor/FilterEditorSyntax";
import SyntaxGuide from "@/components/editor/SyntaxGuide";
import { useToast } from "@/hooks/use-toast";
import { validateFilter } from "@/utils/filterValidator";
import type { ValidationMessage } from "@/types/filter";

export const FilterEditor: React.FC = () => {
  const { toast } = useToast();
  const [filterContent, setFilterContent] = useState<string>("");
  const [importedFilterName, setImportedFilterName] = useState<string>("");
  const [importedFilterId, setImportedFilterId] = useState<string>("");
  const [validationMessages, setValidationMessages] = useState<ValidationMessage[]>([]);
  const [showSyntaxGuide, setShowSyntaxGuide] = useState(false);
  const editorRef = useRef<FilterEditorSyntaxHandle>(null);

  useEffect(() => {
    const checkImportedFilter = async () => {
      const importedFilter = localStorage.getItem("importedFilter");
      const importedFilterName = localStorage.getItem("importedFilterName");
      const importedFilterId = localStorage.getItem("importedFilterId");
      if (importedFilter) {
        if (importedFilter === 'undefined' || importedFilter === '') {
          toast({
            title: "Import Error",
            description: "Filter content is empty or undefined",
            variant: "destructive",
          });
          localStorage.removeItem("importedFilter");
          localStorage.removeItem("importedFilterName");
          localStorage.removeItem("importedFilterId");
          return;
        }
        setFilterContent(importedFilter);
        setImportedFilterName(importedFilterName || "");
        setImportedFilterId(importedFilterId || "");
        localStorage.removeItem("importedFilter");
        localStorage.removeItem("importedFilterName");
        localStorage.removeItem("importedFilterId");
        toast({
          title: "Filter Imported",
          description: `Successfully imported ${importedFilterName || "filter"}`,
        });
      }
    };

    checkImportedFilter();
  }, [toast]);

  const runValidation = useCallback((content: string) => {
    if (!content.trim()) {
      setValidationMessages([]);
      return;
    }
    const result = validateFilter(content);
    setValidationMessages(result.errors);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => runValidation(filterContent), 600);
    return () => clearTimeout(timer);
  }, [filterContent, runValidation]);

  const jumpToLine = useCallback((line: number) => {
    editorRef.current?.jumpToLine(line);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <FileImport
            onImport={setFilterContent}
            content={filterContent}
            showSyntaxGuide={showSyntaxGuide}
            setShowSyntaxGuide={setShowSyntaxGuide}
            importedFilterName={importedFilterName}
            importedFilterId={importedFilterId}
            validationMessages={validationMessages}
            onJumpToLine={jumpToLine}
          />
          <div className="flex-1 p-2 md:p-4 overflow-hidden">
            <Card className="h-full bg-[#1a1a1a] border-[#2a2a2a]">
              {showSyntaxGuide ? (
                <SyntaxGuide />
              ) : (
                <FilterEditorSyntax
                  ref={editorRef}
                  value={filterContent}
                  onChange={setFilterContent}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterEditor;
