'use client'

import React, { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { WorkspaceNode, getNodeIconData } from '@/lib/node-utils'

interface ConnectNodeModalProps {
  isOpen: boolean
  onClose: () => void
  nodes: WorkspaceNode[]
  onSelect: (targetNodeId: string) => void
  currentNodeId: string
  alreadyConnectedIds?: string[]
}

export default function ConnectNodeModal({
  isOpen,
  onClose,
  nodes,
  onSelect,
  currentNodeId,
  alreadyConnectedIds = []
}: ConnectNodeModalProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Lọc danh sách node dựa trên tìm kiếm
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) {
      // Nếu không search, gợi ý các node gần đây hoặc ẩn đi tùy UX. 
      // Ở đây ta hiển thị tất cả trừ node hiện tại và các node đã nối.
      return nodes.filter(n => n.id !== currentNodeId && !alreadyConnectedIds.includes(n.id))
    }

    const query = searchQuery.toLowerCase()
    return nodes.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(query)
      const isNotCurrent = n.id !== currentNodeId
      const isNotConnected = !alreadyConnectedIds.includes(n.id)
      return matchesSearch && isNotCurrent && isNotConnected
    })
  }, [searchQuery, nodes, currentNodeId, alreadyConnectedIds])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div 
        className="bg-surface w-full max-w-md rounded-2xl border border-border-main flex flex-col max-h-[80vh] overflow-hidden shadow-overlay"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border-main/50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-secondary text-base">Kết nối với Node khác</h3>
            <p className="text-xs text-secondary/50 mt-0.5">Chọn một node để tạo liên kết</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-hover-bg rounded-full text-secondary/50 hover:text-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-border-main/30">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" />
            <input
              type="text"
              placeholder="Tìm kiếm node theo tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-active-bg/30 border border-border-main rounded-xl text-sm outline-none focus:border-primary transition-colors text-foreground"
              autoFocus
            />
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
          {filteredNodes.length === 0 ? (
            <div className="text-center text-xs text-secondary/50 py-8">
              Không tìm thấy node nào phù hợp
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredNodes.map(node => {
                const { icon: Icon, color } = getNodeIconData(node.type, node.url)
                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      onSelect(node.id)
                      setSearchQuery('')
                      onClose()
                    }}
                    className="flex items-center gap-3 p-2.5 hover:bg-hover-bg rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="w-8 h-8 bg-active-bg/50 rounded-lg flex items-center justify-center text-secondary">
                      <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-secondary truncate group-hover:text-primary transition-colors">
                        {node.title}
                      </h4>
                      <p className="text-xs text-secondary/40 mt-0.5 capitalize">
                        {node.type}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
