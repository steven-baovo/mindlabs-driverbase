'use client'

import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { FileText } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/local-first/db'
import { useRouter } from 'next/navigation'

export default function NoteNode({ id, data, selected }: { id: string; data: any; selected: boolean }) {
  const router = useRouter()
  const liveNote = useLiveQuery(
    () => (data.noteId ? db.mind_notes.get(data.noteId) : Promise.resolve(null)),
    [data.noteId]
  ) as any

  const displayTitle = liveNote ? liveNote.title : (data.label || 'Untitled Note')
  const displayContent = liveNote !== undefined ? (liveNote ? liveNote.content : null) : data.content

  function extractText(node: any): string {
    if (!node) return ''
    if (node.type === 'text') return node.text
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractText).join(node.type === 'paragraph' ? '\n' : ' ')
    }
    return ''
  }

  return (
    <div 
      onDoubleClick={(e) => {
        e.stopPropagation()
        if (data.noteId) {
          router.replace(`/workspace?note=${data.noteId}`)
        }
      }}
      className={`group relative bg-white rounded-2xl border-2 transition-all w-80 max-h-96 flex flex-col shadow-none ${selected ? 'border-primary' : 'border-border-main'}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border-main bg-slate-50/50 rounded-t-2xl">
        <FileText className="w-4 h-4 text-secondary" strokeWidth={2} />
        <h4 className="text-sm font-semibold text-foreground truncate">{displayTitle}</h4>
      </div>
      
      {/* Content */}
      <div className="p-3 overflow-y-auto text-xs text-gray-600 leading-relaxed max-h-60">
        {displayContent ? (
          typeof displayContent === 'string' ? (
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: displayContent }} />
          ) : (
            <div className="whitespace-pre-wrap">{extractText(displayContent)}</div>
          )
        ) : (
          <p className="text-gray-400 italic">Không có nội dung</p>
        )}
      </div>
      
      {/* Handles */}
      <Handle id="top" type="target" position={Position.Top} className={`border-2 border-white transition-all z-50 hover:scale-125 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ backgroundColor: '#94A3B8', width: '10px', height: '10px' }} />
      <Handle id="bottom" type="source" position={Position.Bottom} className={`border-2 border-white transition-all z-50 hover:scale-125 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ backgroundColor: '#94A3B8', width: '10px', height: '10px' }} />
      <Handle id="left" type="target" position={Position.Left} className={`border-2 border-white transition-all z-50 hover:scale-125 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ backgroundColor: '#94A3B8', width: '10px', height: '10px' }} />
      <Handle id="right" type="source" position={Position.Right} className={`border-2 border-white transition-all z-50 hover:scale-125 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ backgroundColor: '#94A3B8', width: '10px', height: '10px' }} />
    </div>
  )
}
