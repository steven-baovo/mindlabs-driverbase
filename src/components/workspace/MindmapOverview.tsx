'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { ReactFlow, Node, Edge, Handle, Position } from '@xyflow/react'
import { buildTree, TreeNode, WorkspaceNode, getNodeIconData } from '@/lib/node-utils'
import { Plus, FileText, Share2, Folder, LayoutGrid } from 'lucide-react'
import { useLocalWorkspace } from '@/lib/local-first/useLocalWorkspace'
import '@xyflow/react/dist/style.css'

interface MindmapOverviewProps {
  nodes: WorkspaceNode[]
  onRefetch?: () => void
  onNodeCreated?: (parentId: string) => void
  onSelectNote?: (noteId: string) => void
  onSelectCanvas?: (mapId: string) => void
  onSelectLink?: (linkId: string) => void
}

const CustomNode = ({ data }: any) => {
  const { icon: Icon, color } = getNodeIconData(data.type, data.url)
  const [showMenu, setShowMenu] = useState(false)
  
  return (
    <div 
      className="flex items-center gap-2 p-1.5 bg-white border border-border-main/50 rounded-lg text-secondary text-[12px] hover:text-foreground transition-colors cursor-pointer relative group"
      onMouseLeave={() => setShowMenu(false)}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Icon className={`w-3.5 h-3.5 ${color}`} strokeWidth={1.5} />
      <span className="truncate max-w-[150px]">{data.label}</span>
      
      {/* Nút [+] chỉ hiện khi là folder */}
      {data.type === 'folder' && (
        <button 
          onMouseEnter={() => setShowMenu(true)}
          className="w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ml-1"
        >
          <Plus className="w-2.5 h-2.5" />
        </button>
      )}

      {/* Menu xổ ra */}
      {showMenu && (
        <div className="absolute top-0 left-full bg-white border border-border-strong rounded-lg p-1 flex gap-1 z-50">
          <button 
            onClick={(e) => { e.stopPropagation(); data.onAddChild('note'); setShowMenu(false); }}
            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-primary"
            title="Note"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); data.onAddChild('map'); setShowMenu(false); }}
            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-primary"
            title="Canvas"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); data.onAddChild('link'); setShowMenu(false); }}
            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-primary"
            title="Link"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); data.onAddChild('folder'); setShowMenu(false); }}
            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-primary"
            title="Folder"
          >
            <Folder className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

export default function MindmapOverview({ nodes, onRefetch, onNodeCreated, onSelectNote, onSelectCanvas, onSelectLink }: MindmapOverviewProps) {
  const tree = useMemo(() => buildTree(nodes), [nodes])
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const { createNode } = useLocalWorkspace()

  const handleAddChild = async (parentId: string, type: 'folder' | 'note' | 'map' | 'link') => {
    // createNode tự động sinh mindmap/note nội bộ nên không cần gọi API rời
    const { data } = await createNode({
      title: `Untitled ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      parent_id: parentId,
      order: Math.max(...nodes.filter(n => n.parent_id === parentId).map(n => n.order || 0), -1) + 1,
    })

    if (data) {
      if (onRefetch) onRefetch()
      if (onNodeCreated) onNodeCreated(parentId)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(true)
        // Ngăn cuộn trang khi bấm Space
        if (document.activeElement === document.body) {
          e.preventDefault()
        }
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const { rfNodes, rfEdges } = useMemo(() => {
    const rfNodes: Node[] = []
    const rfEdges: Edge[] = []
    let currentY = 50 // Bắt đầu cách lề trên một chút

    function traverse(node: TreeNode, level: number, parentId: string | null): number {
      const x = level * 180 // Dãn cách chiều ngang
      let y = 0

      if (node.children.length > 0) {
        let sumY = 0
        node.children.forEach(child => {
          sumY += traverse(child, level + 1, node.id)
        })
        y = sumY / node.children.length // Căn giữa cha theo các con
      } else {
        y = currentY
        currentY += 50 // Dãn cách chiều dọc cho các node lá
      }

      rfNodes.push({
        id: node.id,
        position: { x, y },
        data: { 
          label: node.title, 
          type: node.type, 
          url: node.url,
          note_id: node.note_id,
          map_id: node.map_id,
          onAddChild: (type: any) => handleAddChild(node.id, type)
        },
        type: 'custom',
        draggable: false, // Khóa vị trí không cho kéo
      })

      if (parentId) {
        rfEdges.push({
          id: `e-${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
          type: 'default',
          style: { stroke: '#e5e7eb', strokeWidth: 1 },
        })
      }

      return y
    }

    tree.forEach(rootNode => {
      traverse(rootNode, 0, null)
      currentY += 70 // Khoảng cách giữa các cây (nếu có nhiều root)
    })

    return { rfNodes, rfEdges }
  }, [tree])

  const onNodeDoubleClick = (event: React.MouseEvent, node: Node) => {
    const data = node.data as any
    if (data.type === 'note' && data.note_id) {
      onSelectNote?.(data.note_id)
    } else if (data.type === 'map' && data.map_id) {
      onSelectCanvas?.(data.map_id)
    } else if (data.type === 'link') {
      onSelectLink?.(node.id)
    }
  }

  return (
    <div className="w-full h-full bg-white relative">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodeDoubleClick={onNodeDoubleClick}
        panOnDrag={isSpacePressed}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      />
      

    </div>
  )
}
