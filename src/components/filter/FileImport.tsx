import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";

interface FileImportProps {
  onImport: (content: string) => void;
  content?: string;
}

export const FileImport: React.FC<FileImportProps> = ({
  onImport,
  content,
}) => {
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      onImport(text);
    }
  };

  const handleExport = () => {
    if (!content) return;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "divineview.filter";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2 p-4 border-b border-[#2a2a2a]">
      <Button
        variant="outline"
        className="text-gray-300 hover:text-white bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a]"
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <Upload className="w-4 h-4 mr-2" />
        Import Filter
      </Button>
      <Button
        variant="outline"
        className="text-gray-300 hover:text-white bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a]"
        onClick={handleExport}
        disabled={!content}
      >
        <Download className="w-4 h-4 mr-2" />
        Export Filter
      </Button>
      <input
        id="fileInput"
        type="file"
        accept=".filter"
        className="hidden"
        onChange={handleFileImport}
      />
    </div>
  );
};
