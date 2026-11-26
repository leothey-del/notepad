"use client";

import { useEffect } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import CodeBlockNode from "./CodeBlockNode";

const lowlight = createLowlight(all);

function looksLikeCode(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  if (/^```[\w-]*\n[\s\S]*```$/.test(trimmed)) return true;

  const lines = trimmed.split("\n");
  if (lines.length < 2) return false;

  const strongCodePatterns = [
    /\{\/\*[\s\S]*?\*\/\}/,
    /\bclassName=/,
    /^\s*(import|export)\s+.*from\s+['"]/m,
    /=>\s*[{(]/,
  ];

  if (strongCodePatterns.some((rx) => rx.test(trimmed))) {
    return true;
  }

  const generalPatterns = [
    /^\s*(const|let|var|function|class|interface|type|return|if|for|while|def|fn|pub|struct|enum|package)\b/m,
    /<\/?[a-zA-Z][\w-]*(\s|>|\/>)/,
    /[{};]\s*$/m,
    /^\s*(\/\/|\/\*|#include|async |await |SELECT |INSERT |UPDATE |DELETE )/im,
  ];

  const matches = generalPatterns.filter((rx) => rx.test(trimmed)).length;
  return matches >= 2;
}

function detectLanguage(code: string): string {
  if (/className=|<[A-Z][A-Za-z0-9]*/.test(code)) {
    return /:\s*(string|number|boolean|React\.|[A-Z]\w*Props)/.test(code)
      ? "tsx"
      : "jsx";
  }

  const result = lowlight.highlightAuto(code);
  return result.data?.language || "typescript";
}

type NoteEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function NoteEditor({ value, onChange }: NoteEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockNode);
        },
      }).configure({
        lowlight,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "min-h-[75vh] w-full px-2.5 py-1 font-serif text-base leading-relaxed text-gray-900 focus:outline-none",
      },
      handlePaste(view, event) {
        const text = event.clipboardData?.getData("text/plain");
        if (!text) return false;

        const { $from } = view.state.selection;
        if ($from.parent.type.name === "codeBlock") {
          return false;
        }

        if (!looksLikeCode(text)) {
          return false;
        }

        const fencedMatch = text.trim().match(/^```([\w-]*)\n([\s\S]*?)\n?```$/);
        const cleanCode = fencedMatch ? fencedMatch[2] : text.replace(/\r\n/g, "\n");
        const language = fencedMatch?.[1] || detectLanguage(cleanCode);

        const codeBlockType = view.state.schema.nodes.codeBlock;
        if (!codeBlockType) return false;

        const node = codeBlockType.create(
          { language },
          view.state.schema.text(cleanCode)
        );

        const tr = view.state.tr.replaceSelectionWith(node).scrollIntoView();
        view.dispatch(tr);
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [editor, value]);

  return <EditorContent editor={editor} />;
}