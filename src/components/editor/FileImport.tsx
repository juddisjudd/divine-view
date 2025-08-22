import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, Code, BookOpen, Cloud, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";

interface FileImportProps {
  onImport: (content: string) => void;
  content?: string;
  className?: string;
  showSyntaxGuide: boolean;
  setShowSyntaxGuide: (show: boolean) => void;
}

export const FileImport: React.FC<FileImportProps> = ({
  onImport,
  content,
  className,
  showSyntaxGuide,
  setShowSyntaxGuide,
}) => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFilename, setExportFilename] = useState("filter");
  const [exportMode, setExportMode] = useState<'download' | 'sync' | 'update'>('download');

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
      console.log('Imported file content:', text); // Debug log
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

      const filterName = exportFilename.trim() || "filter";
      
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setShowExportDialog(false);
      setExportFilename("filter");

      toast({
        title: "Filter synced to PoE",
        description: `Successfully created "${filterName}" in your PoE account`,
      });
    } catch (error) {
      console.error("Error syncing to PoE:", error);
      toast({
        title: "Sync failed",
        description: "Failed to sync filter to PoE. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    if (exportMode === 'download') {
      handleDownload();
    } else if (exportMode === 'sync') {
      handleSyncToPoE();
    }
  };

  const handleExportClick = () => {
    if (!content) return;
    setShowExportDialog(true);
  };

  return (
    <>
      <div
        className={`flex items-center gap-2 p-4 border-b border-[#2a2a2a] ${className}`}
      >
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
                  <Button
                    variant="outline"
                    className={`justify-start ${exportMode === 'sync' ? 'bg-[#3a3a3a] border-blue-500' : 'bg-[#2a2a2a] border-[#3a3a3a]'} text-gray-300 hover:text-white hover:bg-[#3a3a3a]`}
                    onClick={() => setExportMode('sync')}
                  >
                    <Cloud className="w-4 h-4 mr-2" />
                    Sync to PoE Account
                  </Button>
                )}
              </div>
            </div>

            {/* Filename Input */}
            <div className="space-y-2">
              <Input
                type="text"
                placeholder={exportMode === 'download' ? "Enter filename" : "Enter filter name"}
                value={exportFilename}
                onChange={(e) => setExportFilename(e.target.value)}
                className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleExport();
                  }
                }}
              />
              <p className="text-sm text-gray-400">
                {exportMode === 'download' 
                  ? ".filter will be appended automatically if not included"
                  : "This will be the filter name in your PoE account"
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
                className="bg-[#922729] hover:bg-[#922729]/90 text-white"
              >
                {exportMode === 'download' ? (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download
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
