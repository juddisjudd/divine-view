import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, Code, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFilename, setExportFilename] = useState("filter");

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

  const handleExport = () => {
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
        title: "Filter exported",
        description: `Successfully exported as ${filename}`,
      });
    } catch (error) {
      console.error("Error exporting file:", error);
      toast({
        title: "Export failed",
        description: "Failed to export filter file. Please try again.",
        variant: "destructive",
      });
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
          <Download className="w-4 h-4 mr-2" />
          Export Filter
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
          <div className="space-y-2 py-2">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter filename"
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
                .filter will be appended automatically if not included
              </p>
            </div>
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
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
