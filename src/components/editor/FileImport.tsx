import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, Code, BookOpen, Cloud, Save, AlertTriangle, AlertCircle, CheckCircle2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { parseApiError, requiresReAuth } from "@/utils/api-error-handler";
import type { ValidationMessage } from "@/types/filter";

interface FileImportProps {
  onImport: (content: string) => void;
  content?: string;
  showSyntaxGuide: boolean;
  setShowSyntaxGuide: (show: boolean) => void;
  importedFilterName?: string;
  importedFilterId?: string;
  validationMessages?: ValidationMessage[];
  onJumpToLine?: (line: number) => void;
}

export const FileImport: React.FC<FileImportProps> = ({
  onImport,
  content,
  showSyntaxGuide,
  setShowSyntaxGuide,
  importedFilterName,
  importedFilterId,
  validationMessages = [],
  onJumpToLine,
}) => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFilename, setExportFilename] = useState("filter");
  const [exportMode, setExportMode] = useState<'download' | 'sync' | 'update'>('download');
  const [showValidationPanel, setShowValidationPanel] = useState(false);

  const errorCount = validationMessages.filter(m => m.severity === "error").length;
  const warningCount = validationMessages.filter(m => m.severity === "warning").length;

  // Update export filename when imported filter name changes
  React.useEffect(() => {
    if (importedFilterName) {
      setExportFilename(importedFilterName);
      // If we have an imported filter ID, default to update mode
      if (importedFilterId) {
        setExportMode('update');
      }
    }
  }, [importedFilterName, importedFilterId]);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      if (!file.name.toLowerCase().endsWith(".filter")) {
        toast({
          title: "Invalid file type",
          description: "Please select a .filter file",
          variant: "destructive",
        });
        return;
      }

      const text = await file.text();
      if (!text) {
        toast({
          title: "Import failed", 
          description: "File appears to be empty",
          variant: "destructive",
        });
        return;
      }
      onImport(text);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Filter imported",
        description: `Successfully imported ${file.name}`,
      });
    } catch (error) {
      console.error("Error importing file:", error);
      toast({
        title: "Import failed",
        description: "Failed to import filter file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    try {
      if (!content) return;

      let filename = exportFilename.trim();
      if (!filename) {
        filename = "filter";
      }
      if (!filename.toLowerCase().endsWith(".filter")) {
        filename += ".filter";
      }

      const blob = new Blob([content], {
        type: "text/plain;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowExportDialog(false);
      setExportFilename("filter");

      toast({
        title: "Filter downloaded",
        description: `Successfully downloaded as ${filename}`,
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Download failed",
        description: "Failed to download filter file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSyncToPoE = async () => {
    try {
      if (!content || !session?.user?.accessToken) {
        toast({
          title: "Error",
          description: "Please sign in to sync filters to PoE",
          variant: "destructive",
        });
        return;
      }

      const filterName = exportFilename.trim();
      if (!filterName) {
        toast({
          title: "Filter name required",
          description: "Please enter a name for your filter",
          variant: "destructive",
        });
        return;
      }
      
      const response = await fetch('/api/poe/item-filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter_name: filterName,
          realm: 'poe2',
          description: `Created from Divine View editor`,
          type: 'Normal',
          public: false,
          filter: content,
        }),
      });

      if (!response.ok) {
        const apiError = await parseApiError(response);

        if (requiresReAuth(apiError)) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive",
            action: (
              <Button onClick={() => signIn("poe")} size="sm" variant="outline">
                Sign In
              </Button>
            ),
          });
          return;
        }

        toast({
          title: "Sync Failed",
          description: apiError.userMessage,
          variant: "destructive",
        });
        return;
      }

      setShowExportDialog(false);
      setExportFilename("filter");

      toast({
        title: "Filter synced to PoE",
        description: `Successfully created "${filterName}" in your PoE account`,
      });
    } catch (error) {
      console.error("Error syncing to PoE:", error);
      const apiError = await parseApiError(undefined, error);

      toast({
        title: "Sync failed",
        description: apiError.userMessage,
        variant: "destructive",
      });
    }
  };

  const handleUpdateExisting = async () => {
    try {
      if (!content || !session?.user?.accessToken || !importedFilterId) {
        toast({
          title: "Error",
          description: "Cannot update - missing filter ID or authentication",
          variant: "destructive",
        });
        return;
      }

      const filterName = exportFilename.trim();
      if (!filterName) {
        toast({
          title: "Filter name required",
          description: "Please enter a name for your filter",
          variant: "destructive",
        });
        return;
      }
      
      const response = await fetch(`/api/poe/item-filter/${importedFilterId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter_name: filterName,
          realm: 'poe2',
          description: `Updated from Divine View editor`,
          type: 'Normal',
          filter: content,
        }),
      });

      if (!response.ok) {
        const apiError = await parseApiError(response);

        if (requiresReAuth(apiError)) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive",
            action: (
              <Button onClick={() => signIn("poe")} size="sm" variant="outline">
                Sign In
              </Button>
            ),
          });
          return;
        }

        toast({
          title: "Update Failed",
          description: apiError.userMessage,
          variant: "destructive",
        });
        return;
      }

      setShowExportDialog(false);

      toast({
        title: "Filter updated in PoE",
        description: `Successfully updated "${filterName}" in your PoE account`,
      });
    } catch (error) {
      console.error("Error updating PoE filter:", error);
      const apiError = await parseApiError(undefined, error);

      toast({
        title: "Update failed",
        description: apiError.userMessage,
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    if (exportMode === 'download') {
      handleDownload();
    } else if (exportMode === 'sync') {
      handleSyncToPoE();
    } else if (exportMode === 'update') {
      handleUpdateExisting();
    }
  };

  const handleExportClick = () => {
    if (!content) return;
    
    // Set a better default name if empty
    if (!exportFilename || exportFilename === "filter") {
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
      setExportFilename(`filter-${timestamp}`);
    }
    
    setShowExportDialog(true);
  };

  return (
    <>
      <div className="flex flex-col border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2 p-4">
          <Button
            variant="outline"
            className={`text-gray-300 hover:text-white bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a] ${
              !showSyntaxGuide ? "bg-[#3a3a3a]" : ""
            }`}
            onClick={() => setShowSyntaxGuide(false)}
          >
            <Code className="w-4 h-4 mr-2" />
            Editor
          </Button>
          <Button
            variant="outline"
            className={`text-gray-300 hover:text-white bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a] ${
              showSyntaxGuide ? "bg-[#3a3a3a]" : ""
            }`}
            onClick={() => setShowSyntaxGuide(true)}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Syntax Guide
          </Button>
          <Button
            variant="outline"
            className="text-gray-300 hover:text-white bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a]"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Filter
          </Button>
          <Button
            variant="outline"
            className="text-gray-300 hover:text-white bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a]"
            onClick={handleExportClick}
            disabled={!content}
          >
            <Save className="w-4 h-4 mr-2" />
            Save/Export
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".filter"
            className="hidden"
            onChange={handleFileImport}
          />

          {/* Validation badge — only shown when filter has content */}
          {content && (
            <Button
              variant="outline"
              className={`ml-auto flex items-center gap-2 bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a] ${
                errorCount > 0
                  ? "text-red-400 hover:text-red-400"
                  : warningCount > 0
                  ? "text-yellow-400 hover:text-yellow-400"
                  : "text-green-400 hover:text-green-400"
              }`}
              onClick={() => setShowValidationPanel(v => !v)}
            >
              {errorCount > 0 ? (
                <AlertCircle className="w-4 h-4" />
              ) : warningCount > 0 ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {errorCount > 0
                ? `${errorCount} error${errorCount !== 1 ? "s" : ""}`
                : warningCount > 0
                ? `${warningCount} warning${warningCount !== 1 ? "s" : ""}`
                : "Valid"}
            </Button>
          )}
        </div>

        {/* Inline validation panel */}
        {showValidationPanel && content && (
          <div className="border-t border-[#2a2a2a] bg-[#111111]">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {validationMessages.length === 0
                  ? "No issues"
                  : `${validationMessages.length} issue${validationMessages.length !== 1 ? "s" : ""}`}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-500 hover:text-white"
                onClick={() => setShowValidationPanel(false)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            {validationMessages.length === 0 ? (
              <div className="px-4 pb-3 flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Filter is valid
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto pb-2">
                {validationMessages.map((msg, i) => (
                  <button
                    key={i}
                    className="w-full flex items-start gap-3 px-4 py-1.5 hover:bg-[#1a1a1a] text-left transition-colors group cursor-pointer"
                    onClick={() => {
                      onJumpToLine?.(msg.line);
                      setShowValidationPanel(false);
                      setShowSyntaxGuide(false);
                    }}
                  >
                    {msg.severity === "error" ? (
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                    )}
                    <span className="text-xs text-gray-400 shrink-0 w-16">
                      Line {msg.line}
                    </span>
                    <span className="text-xs text-gray-200 group-hover:text-white">
                      {msg.message}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
          <DialogHeader className="text-white">
            <DialogTitle>Export Filter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Export Mode Selection */}
            <div className="space-y-3">
              <p className="text-sm text-gray-300">Choose export option:</p>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  className={`justify-start ${exportMode === 'download' ? 'bg-[#3a3a3a] border-blue-500' : 'bg-[#2a2a2a] border-[#3a3a3a]'} text-gray-300 hover:text-white hover:bg-[#3a3a3a]`}
                  onClick={() => setExportMode('download')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download to Computer
                </Button>
                {session?.user?.accessToken && (
                  <>
                    {importedFilterId ? (
                      <Button
                        variant="outline"
                        className={`justify-start ${exportMode === 'update' ? 'bg-[#3a3a3a] border-blue-500' : 'bg-[#2a2a2a] border-[#3a3a3a]'} text-gray-300 hover:text-white hover:bg-[#3a3a3a]`}
                        onClick={() => setExportMode('update')}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Update in PoE Account
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className={`justify-start ${exportMode === 'sync' ? 'bg-[#3a3a3a] border-blue-500' : 'bg-[#2a2a2a] border-[#3a3a3a]'} text-gray-300 hover:text-white hover:bg-[#3a3a3a]`}
                        onClick={() => setExportMode('sync')}
                      >
                        <Cloud className="w-4 h-4 mr-2" />
                        Sync to PoE Account
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Filename Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                {exportMode === 'download' ? 'Filename' : 'Filter Name*'}
              </label>
              <Input
                type="text"
                placeholder={exportMode === 'download' ? "Enter filename" : exportMode === 'update' ? "Filter name" : "Enter filter name (required)"}
                value={exportFilename}
                onChange={(e) => setExportFilename(e.target.value)}
                className={`bg-[#2a2a2a] border-[#3a3a3a] text-white ${
                  (exportMode === 'sync' || exportMode === 'update') && !exportFilename.trim() ? 'border-red-500' : ''
                }`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleExport();
                  }
                }}
                required={exportMode === 'sync' || exportMode === 'update'}
              />
              <p className="text-sm text-gray-400">
                {exportMode === 'download' 
                  ? ".filter will be appended automatically if not included"
                  : exportMode === 'update'
                  ? "This will update the existing filter in your PoE account"
                  : "This will be the filter name in your PoE account (must be unique)"
                }
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(false)}
                className="bg-[#2a2a2a] border-[#3a3a3a] text-gray-300 hover:text-white hover:bg-[#3a3a3a]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={(exportMode === 'sync' || exportMode === 'update') && !exportFilename.trim()}
                className="bg-[#922729] hover:bg-[#922729]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exportMode === 'download' ? (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </>
                ) : exportMode === 'update' ? (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Update Filter
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4 mr-2" />
                    Sync to PoE
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
