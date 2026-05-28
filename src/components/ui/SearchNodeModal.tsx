'use client'
import { useState, useMemo, useEffect } from 'react'
import { Search, FileText, X, ExternalLink } from 'lucide-react'
import { useLocalWorkspace } from '@/lib/local-first/useLocalWorkspace'
import { getNodeIconData } from '@/lib/node-utils'

interface SearchNodeModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectNode: (node: any) => void
  onSelectExternalLink?: (url: string) => void
}

export function SearchNodeModal({ isOpen, onClose, onSelectNode, onSelectExternalLink }: SearchNodeModalProps) {
  const { nodes } = useLocalWorkspace()
  const [searchQuery, setSearchQuery] = useState('')
  const [externalLink, setExternalLink] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setExternalLink('')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  const handleExternalLinkSubmit = () => {
    if (!externalLink.trim()) return
    onSelectExternalLink?.(externalLink.trim())
    setExternalLink('')
  }

  const filteredNodes = useMemo(() => {
    if (!nodes) return []
    return nodes.filter(node => 
      node.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [nodes, searchQuery])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center pt-[15vh] bg-transparent p-4 animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-surface border border-border-main rounded-xl shadow-overlay overflow-hidden flex flex-col max-h-[60vh] animate-in zoom-in-95 duration-200">
        
        {/* Search Header */}
        <div className="flex flex-col border-b border-border-main">
          <div className="flex items-center gap-3 p-4">
            <Search className="w-5 h-5 text-secondary" />
            <input
              autoFocus
              type="text"
              placeholder="Tìm kiếm node để liên kết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-standard text-foreground placeholder:text-secondary"
            />
            <button onClick={onClose} className="p-1 rounded-md hover:bg-hover-bg text-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 px-4 pb-4 border-t border-border-main/40 pt-3">
            <ExternalLink className="w-4 h-4 text-secondary/70" />
            <input
              type="text"
              placeholder="Nhập liên kết ngoài (ví dụ: https://...)"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleExternalLinkSubmit()
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-foreground placeholder:text-secondary/60"
            />
            {externalLink.trim() && (
              <button 
                onClick={handleExternalLinkSubmit}
                className="px-2.5 py-1 text-[12px] font-medium bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
              >
                Liên kết
              </button>
            )}
          </div>
        </div>

        {/* Node List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredNodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-secondary gap-2 py-12">
              <FileText className="w-8 h-8 opacity-50" />
              <p className="text-[13px]">Không tìm thấy node nào phù hợp.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {filteredNodes.map(node => {
                const { icon: Icon, color } = getNodeIconData(node.type, node.url)
                return (
                  <button
                    key={node.id}
                    onClick={() => onSelectNode(node)}
                    className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg hover:bg-hover-bg transition-colors group"
                  >
                    <Icon className={`w-4 h-4 ${color}`} />
                    <div>
                      <div className="text-[14px] font-normal text-foreground">{node.title || 'Untitled Node'}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
