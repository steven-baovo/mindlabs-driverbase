'use client'
import { useState, useEffect, useRef } from 'react'

import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { db } from '@/lib/local-first/db'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontSize } from '@/lib/tiptap-extensions'

import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, CheckSquare, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Type, Quote,
  Table as TableIcon, Image as ImageIcon, Minus, ChevronRight, Check,
  Link2, ExternalLink, Search, ListTodo, Scissors, Copy, ClipboardPaste, Replace,
  AlignLeft, Plus, Paintbrush
} from 'lucide-react'

import { SearchNodeModal } from '@/components/ui/SearchNodeModal'

// --- Custom SubMenu Components ---

const ContextMenuItem = ({ label, icon: Icon, onClick, active }: { label: string, icon?: any, onClick: () => void, active?: boolean }) => {
  return (
    <div 
      className={`flex items-center gap-2.5 px-3 py-1.5 hover:bg-hover-bg cursor-pointer transition-colors text-[13px] ${active ? 'bg-primary/5 text-primary' : 'text-secondary hover:text-foreground'}`}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      {Icon ? <Icon className="w-4 h-4 opacity-70" strokeWidth={1.5} /> : <div className="w-4 h-4" />}
      <span className="flex-1">{label}</span>
      {active && <Check className="w-3.5 h-3.5 text-primary" strokeWidth={2} />}
    </div>
  )
}

const ContextMenuDivider = () => <div className="h-px bg-border-main my-1" />

const ContextMenuSubMenu = ({ label, icon: Icon, children, isHovered, onMouseEnter, onMouseLeave }: any) => {
  return (
    <div 
      className="relative flex items-center justify-between px-3 py-1.5 hover:bg-hover-bg cursor-pointer text-secondary hover:text-foreground transition-colors text-[13px]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-center gap-2.5">
        {Icon ? <Icon className="w-4 h-4 opacity-70" strokeWidth={1.5} /> : <div className="w-4 h-4" />}
        <span>{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 opacity-50" strokeWidth={1.5} />
      {isHovered && (
        <div className="absolute left-full top-0 ml-1 bg-surface/95 backdrop-blur-md border border-border-main rounded-xl shadow-overlay py-1.5 min-w-[200px] animate-in fade-in zoom-in-95 duration-200 z-[110]">
          {children}
        </div>
      )}
    </div>
  )
}

// --- Main Editor ---

interface ZenEditorProps {
  noteId?: string
  initialContent?: any
  onChange?: (content: any) => void
  onCountChange?: (words: number, chars: number) => void
  placeholder?: string
}

const MediaImageNodeView = (props: any) => {
  const { node } = props
  const src = node.attrs.src
  const [displaySrc, setDisplaySrc] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!src) return

    if (src.startsWith('local-media://')) {
      const mediaId = src.replace('local-media://', '')
      setIsLoading(true)

      // Try local cache first
      db.media_cache.get(mediaId).then((item) => {
        if (item && item.data_url) {
          setDisplaySrc(item.data_url)
          setIsLoading(false)
        } else {
          // If not in local cache, download on demand from Google Drive
          fetch('/api/gdrive/token')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              const token = data?.accessToken
              if (token) {
                import('@/lib/gdrive-api').then(({ downloadMediaFile }) => {
                  downloadMediaFile(token, mediaId).then(dataUrl => {
                    if (dataUrl) {
                      // Save to local cache
                      db.media_cache.put({
                        id: mediaId,
                        data_url: dataUrl,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        is_synced: 1,
                        is_deleted: 0
                      }).then(() => {
                        setDisplaySrc(dataUrl)
                        setIsLoading(false)
                      })
                    } else {
                      setIsLoading(false)
                    }
                  })
                }).catch(() => setIsLoading(false))
              } else {
                setIsLoading(false)
              }
            })
            .catch(() => setIsLoading(false))
        }
      }).catch(() => setIsLoading(false))
    } else {
      setDisplaySrc(src)
    }
  }, [src])

  return (
    <NodeViewWrapper className="relative inline-block my-4 max-w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-hover-bg/50 backdrop-blur-[2px] rounded-lg min-h-[150px] min-w-[200px] border border-border-main animate-pulse">
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[11px] text-secondary">Đang tải ảnh...</span>
          </div>
        </div>
      )}
      <img
        src={displaySrc || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%239ca3af">Loading...</text></svg>'}
        alt={node.attrs.alt}
        title={node.attrs.title}
        className={`rounded-lg max-w-full border border-border-main transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-100'}`}
      />
    </NodeViewWrapper>
  )
}

const MediaImage = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(MediaImageNodeView)
  },
})

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor || null,
        renderHTML: attributes => {
          if (!attributes.backgroundColor) {
            return {}
          }
          return {
            style: `background-color: ${attributes.backgroundColor}`,
          }
        },
      },
    }
  },
})

const extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },
    link: false,
    underline: false,
  }),
  Placeholder.configure({
    placeholder: 'Bắt đầu viết...',
  }),
  MediaImage.configure(),
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
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  CustomTableCell,
  TaskList,
  TaskItem.configure({ nested: true }),
]

const ZenEditor = ({ noteId, initialContent, onChange, onCountChange, placeholder = 'Bắt đầu viết...' }: ZenEditorProps) => {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [isSearchNodeOpen, setIsSearchNodeOpen] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSubMenuEnter = (menuId: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setActiveSubmenu(menuId)
  }

  const handleSubMenuLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveSubmenu(null)
    }, 150)
  }

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
          setActiveSubmenu(null)
          return true
        },
        mousedown: () => {
          if (menuPos) setMenuPos(null)
          return false
        }
      }
    },
  })

  useEffect(() => {
    const handleScroll = () => setMenuPos(null)
    const handleClick = () => setMenuPos(null)
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('click', handleClick)
    }
  }, [])

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent, false)
    } else if (editor && !initialContent) {
      editor.commands.clearContent(false)
    }
  }, [editor, noteId])

  if (!editor) {
    return null
  }

  const selectedText = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ')

  const handleCreateTask = () => {
    if (!selectedText.trim()) return
    // Tạm thời hiển thị alert hoặc log, sau này sẽ gắn vào hàm của Leanity
    alert(`Đã gửi yêu cầu tạo Task: "${selectedText}"`)
    setMenuPos(null)
  }

  const handleBiDirectionalLink = () => {
    setIsSearchNodeOpen(true)
    setMenuPos(null)
  }

  const handleSelectNode = (node: any) => {
    setIsSearchNodeOpen(false)
    const textToInsert = selectedText.trim() ? selectedText : (node.title || 'Untitled Node')
    
    // Nếu có bôi đen, Tiptap sẽ giữ nguyên text và bọc link.
    // Nếu không bôi đen (hoặc khoảng trắng), chèn nguyên khối HTML.
    if (selectedText.trim()) {
      editor.chain().focus().setLink({ href: `/workspace?note=${node.id}` }).run()
    } else {
      editor.chain().focus().insertContent(`<a href="/workspace?note=${node.id}">${textToInsert}</a>`).run()
    }
  }

  const handleSelectExternalLink = (url: string) => {
    setIsSearchNodeOpen(false)
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
    if (selectedText.trim()) {
      editor.chain().focus().setLink({ href: formattedUrl, target: '_blank' }).run()
    } else {
      editor.chain().focus().insertContent(`<a href="${formattedUrl}" target="_blank">${url}</a>`).run()
    }
  }

  const handleInsertLocalImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (event: any) => {
      const file = event.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const result = e.target?.result as string
          if (result) {
            const mediaId = `media-${crypto.randomUUID()}`
            const now = new Date().toISOString()

            // 1. Save to local media cache
            await db.media_cache.put({
              id: mediaId,
              data_url: result,
              created_at: now,
              updated_at: now,
              is_synced: 0,
              is_deleted: 0
            })

            // 2. Add to media outbox
            await db.media_outbox.put({
              record_id: mediaId,
              action: 'create',
              created_at: now
            })

            // 3. Insert referenced image into Editor
            editor.chain().focus().setImage({ src: `local-media://${mediaId}` }).run()

            // 4. Trigger background sync
            window.dispatchEvent(new CustomEvent('mindlabs-trigger-sync'))
          }
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
    setMenuPos(null)
  }

  const handleInsertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: false }).run()
    setMenuPos(null)
  }

  const executeCommand = (fn: () => void) => {
    fn()
    setMenuPos(null)
  }

  return (
    <div className="relative w-full">
      {/* Custom Context Menu - Obsidian Style with Leanity Aesthetics */}
      {menuPos && (
        <div 
          className="fixed z-[100] bg-surface/95 backdrop-blur-md border border-border-main rounded-xl shadow-overlay py-1.5 min-w-[240px] animate-in fade-in zoom-in-95 duration-150 select-none"
          style={{ 
            top: Math.min(menuPos.y, typeof window !== 'undefined' ? window.innerHeight - 400 : menuPos.y), 
            left: Math.min(menuPos.x, typeof window !== 'undefined' ? window.innerWidth - 260 : menuPos.x) 
          }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <ContextMenuItem label="Add link" icon={Link2} onClick={handleBiDirectionalLink} />
          
          <ContextMenuDivider />
          
          <ContextMenuItem label="Trích xuất thành Task mới" icon={ListTodo} onClick={handleCreateTask} />
          
          <ContextMenuDivider />

          {/* FORMAT SUBMENU */}
          <ContextMenuSubMenu 
            label="Format" 
            icon={Type}
            isHovered={activeSubmenu === 'format'}
            onMouseEnter={() => handleSubMenuEnter('format')}
            onMouseLeave={handleSubMenuLeave}
          >
            <ContextMenuItem label="Bold" icon={Bold} active={editor.isActive('bold')} onClick={() => executeCommand(() => editor.chain().focus().toggleBold().run())} />
            <ContextMenuItem label="Italic" icon={Italic} active={editor.isActive('italic')} onClick={() => executeCommand(() => editor.chain().focus().toggleItalic().run())} />
            <ContextMenuItem label="Underline" icon={UnderlineIcon} active={editor.isActive('underline')} onClick={() => executeCommand(() => editor.chain().focus().toggleUnderline().run())} />
            <ContextMenuItem label="Strikethrough" icon={Strikethrough} active={editor.isActive('strike')} onClick={() => executeCommand(() => editor.chain().focus().toggleStrike().run())} />
          </ContextMenuSubMenu>

          {/* PARAGRAPH SUBMENU */}
          <ContextMenuSubMenu 
            label="Paragraph" 
            icon={AlignLeft}
            isHovered={activeSubmenu === 'paragraph'}
            onMouseEnter={() => handleSubMenuEnter('paragraph')}
            onMouseLeave={handleSubMenuLeave}
          >
            <ContextMenuItem label="Bullet list" icon={List} active={editor.isActive('bulletList')} onClick={() => executeCommand(() => editor.chain().focus().toggleBulletList().run())} />
            <ContextMenuItem label="Numbered list" icon={ListOrdered} active={editor.isActive('orderedList')} onClick={() => executeCommand(() => editor.chain().focus().toggleOrderedList().run())} />
            <ContextMenuItem label="Task list" icon={CheckSquare} active={editor.isActive('taskList')} onClick={() => executeCommand(() => editor.chain().focus().toggleTaskList().run())} />
            
            <ContextMenuDivider />
            
            <ContextMenuItem label="Heading 1" icon={Heading1} active={editor.isActive('heading', { level: 1 })} onClick={() => executeCommand(() => editor.chain().focus().toggleHeading({ level: 1 }).run())} />
            <ContextMenuItem label="Heading 2" icon={Heading2} active={editor.isActive('heading', { level: 2 })} onClick={() => executeCommand(() => editor.chain().focus().toggleHeading({ level: 2 }).run())} />
            <ContextMenuItem label="Heading 3" icon={Heading3} active={editor.isActive('heading', { level: 3 })} onClick={() => executeCommand(() => editor.chain().focus().toggleHeading({ level: 3 }).run())} />
            <ContextMenuItem label="Heading 4" icon={Heading4} active={editor.isActive('heading', { level: 4 })} onClick={() => executeCommand(() => editor.chain().focus().toggleHeading({ level: 4 }).run())} />
            <ContextMenuItem label="Heading 5" icon={Heading5} active={editor.isActive('heading', { level: 5 })} onClick={() => executeCommand(() => editor.chain().focus().toggleHeading({ level: 5 }).run())} />
            <ContextMenuItem label="Heading 6" icon={Heading6} active={editor.isActive('heading', { level: 6 })} onClick={() => executeCommand(() => editor.chain().focus().toggleHeading({ level: 6 }).run())} />
            
            <ContextMenuDivider />

            <ContextMenuItem label="Body" icon={Type} active={editor.isActive('paragraph')} onClick={() => executeCommand(() => editor.chain().focus().setParagraph().run())} />
            <ContextMenuItem label="Quote" icon={Quote} active={editor.isActive('blockquote')} onClick={() => executeCommand(() => editor.chain().focus().toggleBlockquote().run())} />
          </ContextMenuSubMenu>

          {/* INSERT SUBMENU */}
          <ContextMenuSubMenu 
            label="Insert" 
            icon={Plus}
            isHovered={activeSubmenu === 'insert'}
            onMouseEnter={() => handleSubMenuEnter('insert')}
            onMouseLeave={handleSubMenuLeave}
          >
            <ContextMenuItem label="Table" icon={TableIcon} onClick={handleInsertTable} />
            <ContextMenuItem label="Picture" icon={ImageIcon} onClick={handleInsertLocalImage} />
            <ContextMenuItem label="Horizontal rule" icon={Minus} onClick={() => executeCommand(() => editor.chain().focus().setHorizontalRule().run())} />
          </ContextMenuSubMenu>

          {editor.isActive('table') && (
            <>
              <ContextMenuDivider />
              {/* TABLE ACTIONS SUBMENU */}
              <ContextMenuSubMenu 
                label="Table Actions" 
                icon={TableIcon}
                isHovered={activeSubmenu === 'tableActions'}
                onMouseEnter={() => handleSubMenuEnter('tableActions')}
                onMouseLeave={handleSubMenuLeave}
              >
                <ContextMenuItem label="Thêm hàng phía trên" onClick={() => executeCommand(() => editor.chain().focus().addRowBefore().run())} />
                <ContextMenuItem label="Thêm hàng phía dưới" onClick={() => executeCommand(() => editor.chain().focus().addRowAfter().run())} />
                <ContextMenuItem label="Xóa hàng" onClick={() => executeCommand(() => editor.chain().focus().deleteRow().run())} />
                <ContextMenuDivider />
                <ContextMenuItem label="Thêm cột bên trái" onClick={() => executeCommand(() => editor.chain().focus().addColumnBefore().run())} />
                <ContextMenuItem label="Thêm cột bên phải" onClick={() => executeCommand(() => editor.chain().focus().addColumnAfter().run())} />
                <ContextMenuItem label="Xóa cột" onClick={() => executeCommand(() => editor.chain().focus().deleteColumn().run())} />
                <ContextMenuDivider />
                <ContextMenuItem label="Trộn ô (Merge)" onClick={() => executeCommand(() => editor.chain().focus().mergeCells().run())} />
                <ContextMenuItem label="Tách ô (Split)" onClick={() => executeCommand(() => editor.chain().focus().splitCell().run())} />
                <ContextMenuDivider />
                <ContextMenuItem label="Xóa bảng" onClick={() => executeCommand(() => editor.chain().focus().deleteTable().run())} />
              </ContextMenuSubMenu>

              {/* CELL COLOR SUBMENU */}
              <ContextMenuSubMenu 
                label="Cell Background" 
                icon={Paintbrush}
                isHovered={activeSubmenu === 'cellColor'}
                onMouseEnter={() => handleSubMenuEnter('cellColor')}
                onMouseLeave={handleSubMenuLeave}
              >
                <ContextMenuItem label="Mặc định" onClick={() => executeCommand(() => editor.chain().focus().setCellAttribute('backgroundColor', null).run())} />
                <ContextMenuItem label="Xám nhạt" onClick={() => executeCommand(() => editor.chain().focus().setCellAttribute('backgroundColor', '#f3f4f6').run())} />
                <ContextMenuItem label="Đỏ nhạt" onClick={() => executeCommand(() => editor.chain().focus().setCellAttribute('backgroundColor', '#fee2e2').run())} />
                <ContextMenuItem label="Xanh lá nhạt" onClick={() => executeCommand(() => editor.chain().focus().setCellAttribute('backgroundColor', '#dcfce7').run())} />
                <ContextMenuItem label="Xanh dương nhạt" onClick={() => executeCommand(() => editor.chain().focus().setCellAttribute('backgroundColor', '#dbeafe').run())} />
                <ContextMenuItem label="Vàng nhạt" onClick={() => executeCommand(() => editor.chain().focus().setCellAttribute('backgroundColor', '#fef9c3').run())} />
                <ContextMenuItem label="Tím nhạt" onClick={() => executeCommand(() => editor.chain().focus().setCellAttribute('backgroundColor', '#f3e8ff').run())} />
              </ContextMenuSubMenu>
            </>
          )}

          <ContextMenuDivider />

          <ContextMenuItem label="Cut" icon={Scissors} onClick={() => {
            document.execCommand('cut')
            setMenuPos(null)
          }} />
          <ContextMenuItem label="Copy" icon={Copy} onClick={() => {
            document.execCommand('copy')
            setMenuPos(null)
          }} />
          <ContextMenuItem label="Paste" icon={ClipboardPaste} onClick={async () => {
            try {
              const text = await navigator.clipboard.readText()
              editor.chain().focus().insertContent(text).run()
            } catch (err) {
              console.error('Failed to paste', err)
            }
            setMenuPos(null)
          }} />
          <ContextMenuItem label="Paste as plain text" icon={Replace} onClick={async () => {
            try {
              const text = await navigator.clipboard.readText()
              editor.chain().focus().insertContent(text).run() // insertContent is quite smart, but can be forced to text.
            } catch (err) {
              console.error('Failed to paste', err)
            }
            setMenuPos(null)
          }} />

        </div>
      )}

      {/* Main Editor Area */}
      <EditorContent editor={editor} />

      {/* Reusable Node Selection Modal */}
      <SearchNodeModal 
        isOpen={isSearchNodeOpen} 
        onClose={() => setIsSearchNodeOpen(false)} 
        onSelectNode={handleSelectNode} 
        onSelectExternalLink={handleSelectExternalLink}
      />

    </div>
  )
}

export default ZenEditor
