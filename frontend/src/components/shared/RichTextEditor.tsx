'use client';

import { useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlignExtension from '@tiptap/extension-text-align';
import PlaceholderExtension from '@tiptap/extension-placeholder';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  onClick, isActive, title, children,
}: {
  onClick: () => void; isActive?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} title={title}
      className={`p-2 rounded transition-colors ${isActive ? 'bg-primary/20 text-primary' : 'text-gray-custom hover:bg-white/10'}`}>
      {children}
    </button>
  );
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      LinkExtension.configure({ openOnClick: false, HTMLAttributes: { dir: 'ltr', class: 'text-primary underline' } }),
      TextAlignExtension.configure({ types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right'], defaultAlignment: 'right' }),
      PlaceholderExtension.configure({ placeholder: placeholder || 'متن مقاله را بنویسید...' }),
      ImageExtension.configure({ HTMLAttributes: { class: 'max-w-full h-auto rounded-lg my-4' } }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'prose prose-invert max-w-none min-h-[300px] px-4 py-3 focus:outline-none text-gray-custom', dir: 'rtl' },
    },
  });

  const addImage = useCallback(() => fileInputRef.current?.click(), []);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'articles');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/upload/file`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      const data = await res.json();
      editor.chain().focus().setImage({ src: data.url }).run();
    } catch { /* ignore */ }
    e.target.value = '';
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('آدرس لینک:', prev || 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-dark">
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-white/10 bg-dark-light">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="bold">
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="italic">
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="underline">
          <span className="underline">U</span>
        </ToolbarButton>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="h2">
          H2
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="h3">
          H3
        </ToolbarButton>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="right">
          <span dir="rtl">→</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="center">
          ↔
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="left">
          ←
        </ToolbarButton>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="list">
          ••
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="ol">
          1.
        </ToolbarButton>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <ToolbarButton onClick={addImage} title="image">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </ToolbarButton>
        <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} title="link">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </ToolbarButton>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>

      <EditorContent editor={editor} />

      {editor && (
        <BubbleMenu editor={editor}>
          <div className="flex gap-1 bg-dark border border-white/10 shadow-xl rounded-lg p-1">
            <button onClick={() => editor.chain().focus().toggleBold().run()}
              className={`px-2 py-1 text-sm rounded ${editor.isActive('bold') ? 'bg-primary/20 text-primary' : 'text-gray-custom hover:bg-white/10'}`}>
              <strong>B</strong>
            </button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`px-2 py-1 text-sm rounded ${editor.isActive('italic') ? 'bg-primary/20 text-primary' : 'text-gray-custom hover:bg-white/10'}`}>
              <em>I</em>
            </button>
            <button onClick={addLink}
              className={`px-2 py-1 text-sm rounded ${editor.isActive('link') ? 'bg-primary/20 text-primary' : 'text-gray-custom hover:bg-white/10'}`}>
              Link
            </button>
          </div>
        </BubbleMenu>
      )}
    </div>
  );
}
