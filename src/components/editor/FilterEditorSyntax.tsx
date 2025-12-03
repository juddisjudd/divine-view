import React, { useRef, useEffect } from "react";
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
    { token: "showKeyword", foreground: "#00FF00", fontStyle: "bold" },
    { token: "hideKeyword", foreground: "#EA2027", fontStyle: "bold" },
    { token: "keyword", foreground: "#CC7832", fontStyle: "bold" },
    { token: "condition", foreground: "#ffffff" },
    { token: "operator", foreground: "#e84393" },
    { token: "number", foreground: "#1E90FF" },
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
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const monacoRef = useRef<Monaco | null>(null);
  const colorStylesRef = useRef<HTMLStyleElement | null>(null);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  const updateDecorations = () => {
    if (!editorRef.current || !monacoRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    const text = model.getValue();
    const decorations: editor.IModelDeltaDecoration[] = [];
    const colorStyles: string[] = [];

    // Match RGB/RGBA color values
    const colorRegex =
      /Set(?:Text|Border|Background)Color\s+(\d+)\s+(\d+)\s+(\d+)(?:\s+(\d+))?/g;
    let match;

    while ((match = colorRegex.exec(text))) {
      const [fullMatch, r, g, b, a] = match;
      const startPos = model.getPositionAt(match.index);
      const endPos = model.getPositionAt(match.index + fullMatch.length);

      const rgb = `rgb${a ? "a" : ""}(${r}, ${g}, ${b}${
        a ? `, ${Number(a) / 255}` : ""
      })`;

      // Create a unique class name for this color
      const className = `color-preview-${match.index}`;

      // Collect styles instead of creating individual style tags
      colorStyles.push(`
        .${className}::after {
          background-color: ${rgb};
        }
      `);

      decorations.push({
        range: new monacoRef.current.Range(
          startPos.lineNumber,
          startPos.column,
          endPos.lineNumber,
          endPos.column
        ),
        options: {
          after: {
            content: " ",
            inlineClassName: `color-preview ${className}`,
          },
        },
      });
    }

    // Update or create a single style tag for all color previews
    if (!colorStylesRef.current) {
      colorStylesRef.current = document.createElement("style");
      colorStylesRef.current.id = "poe-filter-color-styles";
      document.head.appendChild(colorStylesRef.current);
    }
    colorStylesRef.current.textContent = colorStyles.join("\n");

    // Update decorations
    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      decorations
    );
  };

  const handleEditorDidMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Add base CSS for color previews (only once)
    if (!document.getElementById("poe-filter-base-styles")) {
      const style = document.createElement("style");
      style.id = "poe-filter-base-styles";
      style.textContent = `
        .color-preview::after {
          content: '';
          display: inline-block;
          width: 12px;
          height: 12px;
          margin-left: 4px;
          vertical-align: middle;
          border: 1px solid #ffffff40;
          border-radius: 2px;
        }
      `;
      document.head.appendChild(style);
    }

    editor.onDidChangeModelContent(() => {
      updateDecorations();
    });

    // Initial decoration update
    updateDecorations();
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
            "condition",
          ],
          [
            /\b(SetTextColor|SetBorderColor|SetBackgroundColor|SetFontSize|PlayEffect|PlayAlertSound|MinimapIcon|CustomAlertSound)\b/,
            "command",
          ],
          [/[0-9]+/, "number"],
          [/"[^"]*"/, "string"],
          [/==|>=|<=|=|<|>/, "operator"],
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
      onMount={handleEditorDidMount}
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
