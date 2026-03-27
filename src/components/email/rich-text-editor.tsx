"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Type,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface RichTextEditorProps {
  onChange?: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  onChange,
  placeholder = "Compose your email...",
}: RichTextEditorProps) {
  const [fontSize, setFontSize] = useState<"S" | "M" | "L">("M");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Placeholder.configure({ placeholder }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "outline-none min-h-[180px] px-3 py-2",
        style: `color: rgba(255,255,255,0.85); font-size: ${fontSize === "S" ? "12px" : fontSize === "L" ? "16px" : "14px"}; line-height: 1.6;`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Update editor font size when it changes
  useEffect(() => {
    if (editor) {
      editor.view.dom.style.fontSize =
        fontSize === "S" ? "12px" : fontSize === "L" ? "16px" : "14px";
    }
  }, [fontSize, editor]);

  const ToolBtn = useCallback(
    ({
      active,
      onClick,
      children,
      title,
    }: {
      active?: boolean;
      onClick: () => void;
      children: React.ReactNode;
      title?: string;
    }) => (
      <button
        type="button"
        title={title}
        onClick={onClick}
        className="p-1.5 rounded transition-all duration-150 cursor-pointer"
        style={{
          color: active ? "#2196F3" : "rgba(255,255,255,0.45)",
          background: active ? "rgba(33,150,243,0.12)" : "transparent",
        }}
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.7)";
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.45)";
        }}
      >
        {children}
      </button>
    ),
    []
  );

  if (!editor) return null;

  return (
    <div
      className="rounded-lg overflow-hidden flex flex-col"
      style={{
        border: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 px-2 py-1.5"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <ToolBtn
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold size={13} />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic size={13} />
        </ToolBtn>

        <div className="w-px h-4 mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />

        <ToolBtn
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          title="Align left"
        >
          <AlignLeft size={13} />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          title="Align center"
        >
          <AlignCenter size={13} />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          title="Align right"
        >
          <AlignRight size={13} />
        </ToolBtn>

        <div className="w-px h-4 mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />

        <ToolBtn
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          <List size={13} />
        </ToolBtn>

        <div className="w-px h-4 mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />

        {/* Font size toggle */}
        <div className="flex items-center gap-0.5">
          <Type size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
          {(["S", "M", "L"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFontSize(s)}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded transition-all duration-150 cursor-pointer"
              style={{
                color: fontSize === s ? "#2196F3" : "rgba(255,255,255,0.35)",
                background: fontSize === s ? "rgba(33,150,243,0.12)" : "transparent",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
        <EditorContent editor={editor} />
      </div>

      <style>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(255,255,255,0.2);
          pointer-events: none;
          height: 0;
        }
        .tiptap ul { list-style: disc; padding-left: 1.5em; }
        .tiptap ol { list-style: decimal; padding-left: 1.5em; }
        .tiptap p { margin: 0.25em 0; }
      `}</style>
    </div>
  );
}
