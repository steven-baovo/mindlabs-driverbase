'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { ReactFlow, Node, Edge, Handle, Position, ReactFlowProvider, useReactFlow } from '@xyflow/react'
import { buildTree, TreeNode, WorkspaceNode, getNodeIconData } from '@/lib/node-utils'
import '@xyflow/react/dist/style.css'

interface InteractiveMinimapProps {
  nodes: WorkspaceNode[]
  onSelectNote?: (noteId: string) => void
  onSelectCanvas?: (mapId: string) => void
  onSelectLink?: (linkId: string) => void
}

const MiniCustomNode = ({ data }: any) => {
  const { icon: Icon, color } = getNodeIconData(data.type, data.url)
  return (
    <div className="px-1.5 py-0.5 bg-white rounded-md border border-border-main flex items-center gap-1 text-[8px] relative">
      <Handle type="target" position={Position.Left} style={{ visibility: 'hidden' }} />
      <Icon className={`w-2 h-2 ${color}`} />
      <span className="truncate max-w-[50px]">{data.label}</span>
      <Handle type="source" position={Position.Right} style={{ visibility: 'hidden' }} />
    </div>
  )
}

const nodeTypes = {
  custom: MiniCustomNode,
}

export default function InteractiveMinimap({ nodes, onSelectNote, onSelectCanvas, onSelectLink }: InteractiveMinimapProps) {
  const [isHovered, setIsHovered] = useState(false)
  const tree = useMemo(() => buildTree(nodes), [nodes])

  const { rfNodes, rfEdges } = useMemo(() => {
    const rfNodes: Node[] = []
    const rfEdges: Edge[] = []
    let currentY = 10

    function traverse(node: TreeNode, level: number, parentId: string | null): number {
      const x = level * 100 // Dãn cách chiều ngang vừa phải
      let y = 0

      if (node.children.length > 0) {
        let sumY = 0
        node.children.forEach(child => {
          sumY += traverse(child, level + 1, node.id)
        })
        y = sumY / node.children.length
      } else {
        y = currentY
        currentY += 30 // Dãn cách chiều dọc vừa phải
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
        },
        type: 'custom',
        draggable: false,
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
      currentY += 30
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
    <div className="relative w-full h-[120px]">
      <div 
        className={`absolute bottom-0 left-0 border border-border-main rounded-xl overflow-hidden bg-gray-50
          w-[400px] h-[300px] origin-bottom-left transition-all duration-300 ease-in-out
          ${isHovered ? 'scale-100 z-[100] border-2 border-border-strong' : 'scale-[0.4] z-10'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >


        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={nodeTypes}
          onNodeDoubleClick={onNodeDoubleClick}
          zoomOnScroll={isHovered}
          zoomOnPinch={isHovered}
          panOnDrag={isHovered}
          zoomOnDoubleClick={false}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          proOptions={{ hideAttribution: true }}
        />
      </div>
    </div>
  )
}
