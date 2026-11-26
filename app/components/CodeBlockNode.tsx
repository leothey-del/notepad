"use client";

import { useState } from "react";
import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Check, Copy, Download } from "lucide-react";

const LANGUAGE_LABELS: Record<string, string> = {
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JSX",
  py: "Python",
  python: "Python",
  html: "HTML",
  xml: "HTML / XML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  bash: "Bash",
  sh: "Shell",
  sql: "SQL",
  cpp: "C++",
  csharp: "C#",
  php: "PHP",
  yaml: "YAML",
};

function formatLanguageLabel(lang?: string): string {
  if (!lang || lang === "auto") return "Auto";
  const key = lang.toLowerCase();
  if (LANGUAGE_LABELS[key]) return LANGUAGE_LABELS[key];
  return key
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export default function CodeBlockNode({ node }: NodeViewProps) {
  const [copied, setCopied] = useState(false);
  const language = node.attrs.language as string | undefined;
  const codeText = node.textContent;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const cleanLang = (language || "txt").toLowerCase();
    const extMap: Record<string, string> = {
      typescript: "ts",
      ts: "ts",
      tsx: "tsx",
      javascript: "js",
      js: "js",
      jsx: "jsx",
      python: "py",
      py: "py",
      html: "html",
      xml: "html",
      css: "css",
      scss: "scss",
      json: "json",
      bash: "sh",
      sh: "sh",
      sql: "sql",
      go: "go",
      rust: "rs",
      java: "java",
      c: "c",
      cpp: "cpp",
      csharp: "cs",
      php: "php",
      ruby: "rb",
      yaml: "yml",
      markdown: "md",
    };
    const ext = extMap[cleanLang] || "txt";
    const blob = new Blob([codeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snippet.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <NodeViewWrapper className="my-4 overflow-hidden rounded-2xl bg-[#181818] text-gray-100 shadow-sm">
      <div
        contentEditable={false}
        className="flex items-center justify-between px-5 pt-4 pb-2 text-sm text-gray-200 select-none"
      >
        <span className="font-sans font-semibold text-gray-200">
          {formatLanguageLabel(language)}
        </span>

        <div className="flex items-center gap-3 text-gray-300">
          <button
            type="button"
            onClick={handleDownload}
            title="Download code"
            className="rounded p-1 hover:bg-white/10 hover:text-white"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            title="Copy code"
            className="rounded p-1 hover:bg-white/10 hover:text-white"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <pre className="overflow-x-auto px-6 pt-2 pb-6 font-mono text-sm leading-relaxed">
        <NodeViewContent />
      </pre>
    </NodeViewWrapper>
  );
}