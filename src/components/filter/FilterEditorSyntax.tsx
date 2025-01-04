import React from "react";
import { Editor, Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";

interface FilterEditorSyntaxProps {
  value: string;
  onChange: (value: string) => void;
}

const customThemeData: editor.IStandaloneThemeData = {
  base: "vs-dark" as const,
  inherit: true,
  rules: [
    { token: "showKeyword", foreground: "#00FF00", fontStyle: "bold" }, // Green for Show
    { token: "hideKeyword", foreground: "#EA2027", fontStyle: "bold" }, // Red for Hide
    { token: "keyword", foreground: "#CC7832", fontStyle: "bold" },
    { token: "condition", foreground: "#ffffff" }, // Updated color
    { token: "operator", foreground: "#e84393" },  // White for operators
    { token: "number", foreground: "#1E90FF" },    // Blue for numbers
    { token: "string", foreground: "#1dd1a1" },
    { token: "comment", foreground: "#4b4b4b", fontStyle: "italic" },
    { token: "command", foreground: "#ffffff" },
  ],
  colors: {
    "editor.background": "#1a1a1a",
    "editor.foreground": "#feca57",
    "editorLineNumber.foreground": "#4b5563",
    "editor.selectionBackground": "#264f78",
    "editor.lineHighlightBackground": "#2a2a2a",
  },
};

export const FilterEditorSyntax: React.FC<FilterEditorSyntaxProps> = ({
  value,
  onChange,
}) => {
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.languages.register({ id: "poe-filter" });

    monaco.languages.setMonarchTokensProvider("poe-filter", {
      defaultToken: "",
      tokenizer: {
        root: [
          [/#.*$/, "comment"],
          [/\bShow\b/, "showKeyword"],
          [/\bHide\b/, "hideKeyword"],
          [
            /\b(ItemLevel|BaseType|StackSize|AreaLevel|Rarity|Class|WaystoneTier|Quality|Sockets|DropLevel)\b/,
            "condition", // Match specified items
          ],
          [
            /\b(SetTextColor|SetBorderColor|SetBackgroundColor|SetFontSize|PlayEffect|PlayAlertSound|MinimapIcon)\b/,
            "command",
          ],
          [/[0-9]+/, "number"],
          [/"[^"]*"/, "string"],
          [/==|>=|<=|=|<|>/, "operator"], // Match operators
        ],
      },
    });
    
    monaco.editor.defineTheme("poe-filter-dark", customThemeData);
  };

  return (
    <Editor
      height="100%"
      defaultLanguage="poe-filter"
      theme="poe-filter-dark"
      value={value}
      onChange={handleEditorChange}
      beforeMount={handleEditorWillMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        renderLineHighlight: "all",
        scrollBeyondLastLine: false,
        wordWrap: "on",
        automaticLayout: true,
        fontFamily: "'Geist Mono', monospace",
      }}
    />
  );
};
