'use client'
import { useState, useEffect, useMemo } from 'react'

import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  Heading1, 
  Heading2, 
  Heading3, 
  Type,
  Palette,
  Plus,
  Minus,
  Image as ImageIcon
} from 'lucide-react'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontSize } from '@/lib/tiptap-extensions'

interface ZenEditorProps {
  initialContent?: any
  onChange?: (content: any) => void
  onCountChange?: (words: number, chars: number) => void
  placeholder?: string
}

const extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4, 5],
    },
    // Vô hiệu hóa các extension này nếu có sẵn trong bản 3.x StarterKit
    // để tránh trùng lặp với extension tải riêng bên ngoài
    link: false,
    underline: false,
  }),
  Placeholder.configure({
    placeholder: 'Bắt đầu viết...',
  }),
  Image.configure(),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-primary underline underline-offset-4 cursor-pointer',
    },
  }),
  Underline.configure(),
  TextStyle,
  Color,
  FontSize,
]

const ZenEditor = ({ initialContent, onChange, onCountChange, placeholder = 'Bắt đầu viết...' }: ZenEditorProps) => {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)

  const editor = useEditor({
    extensions,
    content: (initialContent && Object.keys(initialContent).length > 0) ? initialContent : undefined,
    immediatelyRender: false,
    onCreate: ({ editor }) => {
      const text = editor.getText()
      const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
      const chars = text.length
      onCountChange?.(words, chars)
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON())
      const text = editor.getText()
      const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
      const chars = text.length
      onCountChange?.(words, chars)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] pt-12 pb-[70vh]',
      },
      handleDOMEvents: {
        contextmenu: (view, event) => {
          event.preventDefault()
          setMenuPos({ x: event.clientX, y: event.clientY })
          return true
        },
        mousedown: () => {
          if (menuPos) setMenuPos(null)
          return false
        }
      }
    },
  })

  // Close menu on escape or click outside
  useEffect(() => {
    const handleScroll = () => setMenuPos(null)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!editor) {
    return null
  }

  const COLORS = [
    { name: 'Default', color: 'inherit' },
    { name: 'Primary', color: '#00A693' },
    { name: 'Red', color: '#ef4444' },
    { name: 'Blue', color: '#3b82f6' },
    { name: 'Gray', color: '#6b6b6b' },
  ]

  return (
    <div className="relative w-full">
      {/* Custom Context Menu */}
      {menuPos && (
        <div 
          className="fixed z-[100] flex items-center gap-1 bg-white/95 backdrop-blur-md border border-border-strong p-1.5 rounded-xl animate-in fade-in zoom-in duration-200"
          style={{ 
            top: menuPos.y - 50, // Slightly above the cursor
            left: Math.min(menuPos.x, typeof window !== 'undefined' ? window.innerWidth - 450 : menuPos.x) 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Headings */}
          <div className="flex items-center gap-0.5 mr-1 pr-1 border-r border-border-medium">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: level as any }).run()
                  setMenuPos(null)
                }}
                className={`w-8 h-8 flex items-center justify-center rounded text-[10px] font-bold transition-colors ${editor.isActive('heading', { level }) ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-secondary'}`}
              >
                H{level}
              </button>
            ))}
          </div>

          {/* Basic Formatting */}
          <div className="flex items-center gap-0.5 mr-1 pr-1 border-r border-border-medium">
            <button
              onClick={() => {
                editor.chain().focus().toggleBold().run()
                setMenuPos(null)
              }}
              className={`p-1.5 rounded transition-colors ${editor.isActive('bold') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-secondary'}`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                editor.chain().focus().toggleItalic().run()
                setMenuPos(null)
              }}
              className={`p-1.5 rounded transition-colors ${editor.isActive('italic') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-secondary'}`}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                editor.chain().focus().toggleUnderline().run()
                setMenuPos(null)
              }}
              className={`p-1.5 rounded transition-colors ${editor.isActive('underline') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-secondary'}`}
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Font Size Control */}
          <div className="flex items-center gap-0.5 mr-1 pr-1 border-r border-border-medium">
            <button
              onClick={() => {
                const currentSize = (editor.getAttributes('textStyle').fontSize as string) || '16px'
                const newSize = parseInt(currentSize) + 2 + 'px'
                editor.chain().focus().setFontSize(newSize).run()
              }}
              className="p-1.5 rounded hover:bg-gray-100 text-secondary"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const currentSize = (editor.getAttributes('textStyle').fontSize as string) || '16px'
                const newSize = Math.max(8, parseInt(currentSize) - 2) + 'px'
                editor.chain().focus().setFontSize(newSize).run()
              }}
              className="p-1.5 rounded hover:bg-gray-100 text-secondary"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Color Picker (Simplified) */}
          <div className="flex items-center gap-1 ml-1">
            {COLORS.map((c) => (
              <button
                key={c.color}
                onClick={() => {
                  if (c.color === 'inherit') {
                    editor.chain().focus().unsetColor().run()
                  } else {
                    editor.chain().focus().setColor(c.color).run()
                  }
                  setMenuPos(null)
                }}
                className="w-4 h-4 rounded-full border border-border-medium transition-transform hover:scale-125"
                style={{ backgroundColor: c.color === 'inherit' ? '#eee' : c.color }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Editor Area */}
      <EditorContent editor={editor} />

    </div>
  )
}

export default ZenEditor
