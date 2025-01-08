import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ValidationMessage {
  line: number;
  message: string;
  severity: "error" | "warning";
}

interface ValidationPanelProps {
  messages: ValidationMessage[];
  onClose: () => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  messages,
  onClose,
}) => {
  if (messages.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#2a2a2a] shadow-lg z-50">
      <div className="max-w-screen-2xl mx-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <h3 className="text-white font-medium">
                {messages.length} {messages.length === 1 ? "issue" : "issues"}{" "}
                found
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {messages.map((message, index) => (
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
  );
};
