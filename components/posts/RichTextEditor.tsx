// components/RichTextEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useState } from "react";
import { 
  Bold, Italic, List, ListOrdered, 
  Quote, Undo, Redo, Link as LinkIcon, 
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4 italic',
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: 'mb-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-6 mb-4',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-6 mb-4',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'mb-1',
          },
        }
      }),
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
      }),
      Image,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl("");
      setShowLinkInput(false);
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setShowImageInput(false);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
          className={editor.isActive("bold") ? "bg-accent" : ""}
          title="Bold"
          type="button"
        >
          <Bold className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
          className={editor.isActive("italic") ? "bg-accent" : ""}
          title="Italic"
          type="button"
        >
          <Italic className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBulletList().run();
          }}
          className={editor.isActive("bulletList") ? "bg-accent" : ""}
          title="Bullet List"
          type="button"
        >
          <List className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleOrderedList().run();
          }}
          className={editor.isActive("orderedList") ? "bg-accent" : ""}
          title="Ordered List"
          type="button"
        >
          <ListOrdered className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBlockquote().run();
          }}
          className={editor.isActive("blockquote") ? "bg-accent" : ""}
          title="Quote"
          type="button"
        >
          <Quote className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().undo().run();
          }}
          disabled={!editor.can().undo()}
          title="Undo"
          type="button"
        >
          <Undo className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().redo().run();
          }}
          disabled={!editor.can().redo()}
          title="Redo"
          type="button"
        >
          <Redo className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            setShowLinkInput(!showLinkInput);
          }}
          className={editor.isActive("link") ? "bg-accent" : ""}
          title="Link"
          type="button"
        >
          <LinkIcon className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            setShowImageInput(!showImageInput);
          }}
          title="Image"
          type="button"
        >
          <ImageIcon className="size-4" />
        </Button>
      </div>

      {showLinkInput && (
        <div className="p-2 flex items-center gap-2 bg-muted border-b">
          <Input
            type="url"
            placeholder="Enter URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1"
          />
          <Button variant="default" size="sm" onClick={addLink}>
            Add
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowLinkInput(false)}>
            Cancel
          </Button>
        </div>
      )}

      {showImageInput && (
        <div className="p-2 flex items-center gap-2 bg-muted border-b">
          <Input
            type="url"
            placeholder="Enter image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="flex-1"
          />
          <Button variant="default" size="sm" onClick={addImage}>
            Add
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowImageInput(false)}>
            Cancel
          </Button>
        </div>
      )}

      <EditorContent
        editor={editor}
        className="prose max-w-none p-4 min-h-[100px] max-h-[200px] overflow-y-auto focus:outline-none [&_p]:before:hidden [&_p]:before:!content-none [&_p]:!m-0 [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800 [&_ol]:list-decimal [&_ul]:list-disc bg-card"
      />
    </div>
  );
};

export default RichTextEditor;