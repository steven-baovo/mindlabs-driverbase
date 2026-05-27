'use client'

import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  reconnectEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  useReactFlow,
  MarkerType,
  ConnectionMode,
  SelectionMode,
  NodeChange
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import TextNode from './TextNode'
import NoteNode from './NoteNode'
import { SquarePlus, Hand, MousePointer2, Activity, Plus, Network, Undo, Redo, Minus, Maximize, FileText, Link2, Trash2, LayoutGrid } from 'lucide-react'
import MindmapEdge from './MindmapEdge'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/local-first/db'
import { useLocalWorkspace } from '@/lib/local-first/useLocalWorkspace'
import { useLocalNotes } from '@/lib/local-first/useLocalNotes'
import { useLocalCanvas } from '@/lib/local-first/useLocalCanvas'

import { HelperLinesRenderer } from './HelperLinesRenderer'
import { getHelperLines, HelperLines } from './helperLines'

const nodeTypes = {
  textNode: TextNode,
  noteNode: NoteNode,
}

const edgeTypes = {
  mindmapEdge: MindmapEdge,
}

interface MindmapBoardProps {
  mindmapId: string
}

export default function MindmapBoard({
  mindmapId,
}: MindmapBoardProps) {
  const { title, setTitle, setIsSaving } = useWorkspace()
  const { screenToFlowPosition, getNodes, addNodes, zoomIn, zoomOut, fitView } = useReactFlow()

  const [loading, setLoading] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const { getCanvas, updateCanvas } = useLocalCanvas()
  const { updateNote } = useLocalNotes()
  const { nodes: allWorkspaceNodes, liveNodesReady, updateNode, createNode } = useLocalWorkspace()

  // 1. Live Query Canvas reactively
  const canvas = useLiveQuery(() => db.mindmaps.get(mindmapId), [mindmapId])

  // Lazy-load canvas from server if not locally cached
  useEffect(() => {
    async function fetchData() {
      const exists = await db.mindmaps.get(mindmapId)
      if (!exists) {
        setLoading(true)
      }
      try {
        await getCanvas(mindmapId)
      } catch (err) {
        console.error('Lỗi khi tải canvas:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      setTitle('')
      setIsSaving(false)
    }
  }, [mindmapId, getCanvas, setTitle, setIsSaving])

  const lastLoadedMindmapId = useRef<string | null>(null)

  // Reset canvas states on mindmapId change to avoid cross-contamination
  useEffect(() => {
    setNodes([])
    setEdges([])
    lastLoadedMindmapId.current = null
    lastSavedStateRef.current = null
    hasChangesRef.current = false
  }, [mindmapId, setNodes, setEdges])

  // 2. Reactive binding from canvas useLiveQuery to ReactFlow state
  useEffect(() => {
    if (canvas) {
      if (lastLoadedMindmapId.current !== mindmapId) {
        setTitle(canvas.title)
        
        const initialNodes = Array.isArray(canvas.nodes) ? canvas.nodes : []
        const initialEdges = Array.isArray(canvas.edges) ? canvas.edges : []
        
        const upgradedEdges = initialEdges.map(edge => {
          if (edge.type === 'default' || !edge.type) {
            return {
              ...edge,
              type: 'mindmapEdge',
              data: edge.data || { direction: 'one' },
              style: edge.style || { stroke: '#94A3B8', strokeWidth: 1.5 },
              markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed, color: '#94A3B8' }
            }
          }
          return edge
        })
        
        setNodes(initialNodes)
        setEdges(upgradedEdges)
        lastSavedStateRef.current = { nodes: initialNodes, edges: upgradedEdges, title: canvas.title }
        lastLoadedMindmapId.current = mindmapId
      } else {
        // Sync external changes (like rename in sidebar)
        if (canvas.title !== title) {
          setTitle(canvas.title)
        }
        
        // Sync incoming remote changes or background syncs only if the user is not actively editing
        if (!hasChangesRef.current) {
          // Chỉ cập nhật ReactFlow state nếu dữ liệu thực sự thay đổi (không phải chỉ is_synced)
          // → tránh kích hoạt auto-save → vòng lặp vô hạn
          const incomingNodes = Array.isArray(canvas.nodes) ? canvas.nodes : []
          const incomingEdges = Array.isArray(canvas.edges) ? canvas.edges : []
          const nodesChanged = JSON.stringify(incomingNodes) !== JSON.stringify(lastSavedStateRef.current?.nodes)
          
          const upgradedIncomingEdges = incomingEdges.map(edge => {
            if (edge.type === 'default' || !edge.type) {
              return {
                ...edge,
                type: 'mindmapEdge',
                data: edge.data || { direction: 'one' },
                style: edge.style || { stroke: '#94A3B8', strokeWidth: 1.5 },
                markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed, color: '#94A3B8' }
              }
            }
            return edge
          })
          
          const edgesChanged = JSON.stringify(upgradedIncomingEdges) !== JSON.stringify(lastSavedStateRef.current?.edges)

          if (nodesChanged || edgesChanged) {
            setNodes(incomingNodes)
            setEdges(upgradedIncomingEdges)
            lastSavedStateRef.current = { nodes: incomingNodes, edges: upgradedIncomingEdges, title: canvas.title }
          }
        }
      }
    }
  }, [canvas, mindmapId, setTitle, setNodes, setEdges])

  const [isPanMode, setIsPanMode] = useState(false)
  const [helperLines, setHelperLines] = useState<HelperLines>({})
  const [edgePathType, setEdgePathType] = useState('bezier')
  const [isPathMenuOpen, setIsPathMenuOpen] = useState(false)
  const pathMenuRef = useRef<HTMLDivElement>(null)
  
  const connectingNodeId = useRef<string | null>(null)
  const connectingHandleId = useRef<string | null>(null)
  const connectionMadeRef = useRef(false)
  const isReconnecting = useRef(false)
  
  // Track if changes have been made to trigger save
  const hasChangesRef = useRef(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Undo/Redo State
  const [past, setPast] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([])
  const [future, setFuture] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([])

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false)
  
  const [isLinksPanelOpen, setIsLinksPanelOpen] = useState(false)
  const linksPanelRef = useRef<HTMLDivElement>(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState('')
  const loadingWorkspaceNodes = false

  // Reactive workspace computed states
  const currentCanvasNode = useMemo(() => {
    return allWorkspaceNodes.find(n => n.map_id === mindmapId) || null
  }, [allWorkspaceNodes, mindmapId])

  const parentProject = useMemo(() => {
    if (!currentCanvasNode?.parent_id) return null
    return allWorkspaceNodes.find(n => n.id === currentCanvasNode.parent_id)
  }, [currentCanvasNode, allWorkspaceNodes])

  const linkedNodeIds = useMemo(() => {
    return currentCanvasNode?.connected_node_ids || []
  }, [currentCanvasNode])

  const allAvailableFiles = useMemo(() => {
    return allWorkspaceNodes
      .filter(n => (n.type === 'note' && n.note_id) || (n.type === 'map' && n.map_id))
      .map(n => ({
        id: n.type === 'note' ? n.note_id! : n.map_id!,
        title: n.title,
        type: n.type as 'note' | 'map'
      }))
  }, [allWorkspaceNodes])

  const existingNotes = useMemo(() => {
    return allWorkspaceNodes
      .filter(n => n.type === 'note' && n.note_id)
      .map(n => ({
        id: n.note_id!,
        title: n.title
      }))
  }, [allWorkspaceNodes])

  const availableMindmaps = useMemo(() => {
    return allWorkspaceNodes
      .filter(n => n.type === 'map' && n.map_id && n.map_id !== mindmapId)
      .map(n => ({
        id: n.map_id!,
        title: n.title
      }))
  }, [allWorkspaceNodes, mindmapId])

  // Guard: chỉ auto-register 1 lần duy nhất sau khi IndexedDB đã load xong
  const hasAutoRegisteredRef = useRef(false)

  // Reset guard khi chuyển sang canvas khác
  useEffect(() => {
    hasAutoRegisteredRef.current = false
  }, [mindmapId])

  // Auto-register canvas vào workspace tree nếu chưa có
  // Quan trọng: KHÔNG dùng allWorkspaceNodes trong deps để tránh re-run
  // mỗi khi sync engine pull data về → vòng lặp vô hạn
  useEffect(() => {
    // Chờ IndexedDB hydrate xong và canvas đã load
    if (loading || !liveNodesReady) return
    if (hasAutoRegisteredRef.current) return

    let cancelled = false

    async function checkOrRegisterNode() {
      // Delay nhỏ để IndexedDB kịp commit các thay đổi mới nhất
      await new Promise(resolve => setTimeout(resolve, 500))
      if (cancelled) return

      // Đọc trực tiếp từ db — không phụ thuộc reactive state
      const existingNode = await db.workspace_nodes
        .filter(n => n.map_id === mindmapId && n.is_deleted === 0)
        .first()

      if (cancelled) return

      if (!existingNode) {
        const allRootNodes = await db.workspace_nodes
          .filter(n => n.parent_id === null && n.is_deleted === 0)
          .toArray()
        const maxOrder = allRootNodes.reduce((max, n) => Math.max(max, n.order || 0), -1)
        await createNode({
          title: title || 'Untitled Canvas',
          type: 'map',
          map_id: mindmapId,
          order: maxOrder + 1
        })
      }

      hasAutoRegisteredRef.current = true
    }

    checkOrRegisterNode()

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mindmapId, loading, liveNodesReady, createNode])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pathMenuRef.current && !pathMenuRef.current.contains(event.target as any)) {
        setIsPathMenuOpen(false)
      }
    }
    
    if (isPathMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isPathMenuOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (linksPanelRef.current && !linksPanelRef.current.contains(event.target as any)) {
        setIsLinksPanelOpen(false)
      }
    }
    
    if (isLinksPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isLinksPanelOpen])

  const handleAddLink = useCallback(async (targetNodeId: string) => {
    if (!currentCanvasNode) return
    const updatedLinks = [...linkedNodeIds, targetNodeId]
    await updateNode(currentCanvasNode.id, { connected_node_ids: updatedLinks })
  }, [currentCanvasNode, linkedNodeIds, updateNode])

  const handleRemoveLink = useCallback(async (targetNodeId: string) => {
    if (!currentCanvasNode) return
    const updatedLinks = linkedNodeIds.filter(id => id !== targetNodeId)
    await updateNode(currentCanvasNode.id, { connected_node_ids: updatedLinks })
  }, [currentCanvasNode, linkedNodeIds, updateNode])

  const handleSaveTitle = useCallback(async () => {
    setIsEditingTitle(false)
    if (!tempTitle.trim() || tempTitle === currentCanvasNode?.title) return
    
    if (currentCanvasNode) {
      await updateNode(currentCanvasNode.id, { title: tempTitle })
    }
    
    await updateCanvas(mindmapId, { title: tempTitle })
  }, [tempTitle, currentCanvasNode, mindmapId, updateNode, updateCanvas])
  const takeSnapshot = useCallback(() => {
    setPast((p) => [...p, { nodes, edges }])
    setFuture([])
  }, [nodes, edges])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        document.activeElement?.tagName === 'TEXTAREA' || 
        document.activeElement?.tagName === 'INPUT'
      ) {
        return
      }

      if (e.key === 'Tab') {
        const selectedNode = nodes.find(n => n.selected)
        if (selectedNode) {
          e.preventDefault()
          
          const position = {
            x: selectedNode.position.x + 250,
            y: selectedNode.position.y
          }
          
          const newNodeId = `node-${Date.now()}`
          const newNode: Node = {
            id: newNodeId,
            type: 'textNode',
            position,
            data: { label: '' },
            style: { width: 200 },
          }
          
          const newEdge: Edge = {
            id: `edge-${selectedNode.id}-${newNodeId}`,
            source: selectedNode.id,
            target: newNodeId,
            sourceHandle: 'right',
            targetHandle: 'left',
            type: 'mindmapEdge',
            data: { direction: 'one', pathType: edgePathType },
            style: { stroke: '#94A3B8', strokeWidth: 1.5 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#94A3B8',
            },
          }
          
          takeSnapshot()
          setNodes((nds) => [...nds, newNode])
          setEdges((eds) => [...eds, newEdge])
          hasChangesRef.current = true
        }
      } else if (e.key === 'Enter') {
        const selectedNode = nodes.find(n => n.selected)
        if (selectedNode) {
          e.preventDefault()
          
          const incomingEdge = edges.find(edge => edge.target === selectedNode.id)
          const parentId = incomingEdge?.source
          
          const position = {
            x: selectedNode.position.x,
            y: selectedNode.position.y + 100
          }
          
          const newNodeId = `node-${Date.now()}`
          const newNode: Node = {
            id: newNodeId,
            type: 'textNode',
            position,
            data: { label: '' },
            style: { width: 200 },
          }
          
          takeSnapshot()
          setNodes((nds) => [...nds, newNode])
          
          if (parentId) {
            const newEdge: Edge = {
              id: `edge-${parentId}-${newNodeId}`,
              source: parentId,
              target: newNodeId,
              sourceHandle: 'right',
              targetHandle: 'left',
              type: 'mindmapEdge',
              data: { direction: 'one', pathType: edgePathType },
              style: { stroke: '#94A3B8', strokeWidth: 1.5 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#94A3B8',
              },
            }
            setEdges((eds) => [...eds, newEdge])
          }
          
          hasChangesRef.current = true
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nodes, edges, edgePathType, setNodes, setEdges, takeSnapshot])

  const onLayout = useCallback(() => {
    const layoutedNodes = [...nodes]
    
    const rootNodes = layoutedNodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    )
    
    if (rootNodes.length === 0 && layoutedNodes.length > 0) {
      rootNodes.push(layoutedNodes[0])
    }
    
    const HORIZONTAL_SPACING = 250
    const VERTICAL_SPACING = 80
    const visited = new Set<string>()
    
    function layoutBranch(nodeId: string, startX: number, startY: number): number {
      visited.add(nodeId)
      
      const nodeIndex = layoutedNodes.findIndex(n => n.id === nodeId)
      if (nodeIndex === -1) return 0
      
      const children = edges
        .filter(edge => edge.source === nodeId && !visited.has(edge.target))
        .map(edge => edge.target)
      
      if (children.length === 0) {
        layoutedNodes[nodeIndex] = {
          ...layoutedNodes[nodeIndex],
          position: { x: startX, y: startY }
        }
        return VERTICAL_SPACING
      }
      
      let totalHeight = 0
      children.forEach((childId) => {
        const branchHeight = layoutBranch(
          childId, 
          startX + HORIZONTAL_SPACING, 
          startY + totalHeight
        )
        totalHeight += branchHeight
      })
      
      const parentY = startY + (totalHeight - VERTICAL_SPACING) / 2
      
      layoutedNodes[nodeIndex] = {
        ...layoutedNodes[nodeIndex],
        position: { x: startX, y: parentY }
      }
      
      return totalHeight
    }
    
    let currentY = 0
    rootNodes.forEach(root => {
      const branchHeight = layoutBranch(root.id, 0, currentY)
      currentY += branchHeight + VERTICAL_SPACING
    })
    
    takeSnapshot()
    setNodes(layoutedNodes)
    hasChangesRef.current = true
  }, [nodes, edges, setNodes, takeSnapshot])

  const undo = useCallback(() => {
    if (past.length === 0) return
    
    const previous = past[past.length - 1]
    const newPast = past.slice(0, past.length - 1)
    
    setPast(newPast)
    setFuture((f) => [{ nodes, edges }, ...f])
    
    setNodes(previous.nodes)
    setEdges(previous.edges)
    hasChangesRef.current = true
  }, [past, nodes, edges, setNodes, setEdges])

  const redo = useCallback(() => {
    if (future.length === 0) return
    
    const next = future[0]
    const newFuture = future.slice(1)
    
    setPast((p) => [...p, { nodes, edges }])
    setFuture(newFuture)
    
    setNodes(next.nodes)
    setEdges(next.edges)
    hasChangesRef.current = true
  }, [future, nodes, edges, setNodes, setEdges])

  const handleConnectToMindmap = useCallback((targetMindmap: { id: string; title: string }) => {
    if (targetMindmap.id === mindmapId) return
    
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    })
    
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'textNode',
      position,
      data: { 
        label: targetMindmap.title,
        isLink: true,
        targetId: targetMindmap.id
      },
    }
    
    takeSnapshot()
    setNodes((nds) => nds.concat(newNode))
    hasChangesRef.current = true
    setIsConnectModalOpen(false)
  }, [mindmapId, screenToFlowPosition, setNodes, takeSnapshot])

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      takeSnapshot()
      connectionMadeRef.current = true
      setEdges((eds) => addEdge({ 
        ...params, 
        type: 'mindmapEdge',
        data: { direction: 'one', pathType: edgePathType },
        style: { stroke: '#94A3B8', strokeWidth: 1.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#94A3B8',
        },
      } as Edge, eds))
      hasChangesRef.current = true
    },
    [setEdges, edgePathType, takeSnapshot]
  )

  const onConnectStart = useCallback((_: any, { nodeId, handleId }: { nodeId: string | null, handleId: string | null }) => {
    connectingNodeId.current = nodeId
    connectingHandleId.current = handleId
    connectionMadeRef.current = false
  }, [])

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const sourceId = connectingNodeId.current
      const sourceHandleId = connectingHandleId.current
      const wasConnectionMade = connectionMadeRef.current

      if (!sourceId || wasConnectionMade || isReconnecting.current) {
        connectingNodeId.current = null
        connectingHandleId.current = null
        connectionMadeRef.current = false
        return
      }

      const targetIsPane = (event.target as Element).classList.contains('react-flow__pane')

      if (targetIsPane) {
        const { clientX, clientY } = 'changedTouches' in event 
          ? (event as TouchEvent).changedTouches[0] 
          : (event as MouseEvent)
        
        // Approximate node default size (min-w-[200px], min-h-[48px] + padding)
        const NODE_W = 200
        const NODE_H = 80

        // Offset position so the handle of the new card aligns with the drop point
        // Target handle is the opposite of the source handle
        const positionOffset: Record<string, { x: number; y: number }> = {
          // source=right → target=left → new card appears to the right, left-edge at cursor
          right: { x: 0, y: -NODE_H / 2 },
          // source=left → target=right → new card appears to the left, right-edge at cursor
          left: { x: -NODE_W, y: -NODE_H / 2 },
          // source=bottom → target=top → new card appears below, top-edge at cursor
          bottom: { x: -NODE_W / 2, y: 0 },
          // source=top → target=bottom → new card appears above, bottom-edge at cursor
          top: { x: -NODE_W / 2, y: -NODE_H },
        }

        const offset = (sourceHandleId && positionOffset[sourceHandleId]) || { x: -NODE_W / 2, y: -NODE_H / 2 }
        const dropPosition = screenToFlowPosition({ x: clientX, y: clientY })

        const id = `node-${Date.now()}`
        const newNode: Node = {
          id,
          type: 'textNode',
          position: {
            x: dropPosition.x + offset.x,
            y: dropPosition.y + offset.y,
          },
          data: { label: '' },
        }

        // Pick the opposite handle as target based on the source handle direction
        const oppositeHandle: Record<string, string> = {
          right: 'left',
          left: 'right',
          bottom: 'top',
          top: 'bottom',
        }
        const targetHandle = (sourceHandleId && oppositeHandle[sourceHandleId]) || 'top'

        takeSnapshot()
        setNodes((nds) => nds.concat(newNode))
        setEdges((eds) =>
          eds.concat({
            id: `edge-${sourceId}-${id}`,
            source: sourceId,
            sourceHandle: sourceHandleId,
            target: id,
            targetHandle,
            type: 'mindmapEdge',
            data: { direction: 'one', pathType: edgePathType },
            style: { stroke: '#94A3B8', strokeWidth: 1.5 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#94A3B8',
            },
          } as Edge)
        )
        hasChangesRef.current = true
      }
      
      connectingNodeId.current = null
      connectingHandleId.current = null
      connectionMadeRef.current = false
    },
    [screenToFlowPosition, setNodes, setEdges, edgePathType, takeSnapshot]
  )

  const updateGlobalPathType = (type: string) => {
    takeSnapshot()
    setEdgePathType(type)
    setEdges((eds) => eds.map(e => ({ ...e, data: { ...e.data, pathType: type } })))
    setIsPathMenuOpen(false)
    hasChangesRef.current = true
  }



  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    let currentHelperLines = {}
    let hasDraggingPositionChange = false

    const nextChanges = changes.map((change) => {
      if (change.type === 'position' && change.position) {
        const currentNodes = getNodes()
        const node = currentNodes.find((n) => n.id === change.id)
        if (node) {
          const { snappedPosition, helperLines: lines } = getHelperLines(
            { ...node, position: change.position },
            currentNodes,
            20,
            16
          )
          
          if (change.dragging) {
            currentHelperLines = lines
            hasDraggingPositionChange = true
          }
          
          return {
            ...change,
            position: snappedPosition,
          }
        }
      }
      return change
    })
    
    if (hasDraggingPositionChange) {
      setHelperLines(currentHelperLines)
    }

    onNodesChange(nextChanges)
    hasChangesRef.current = true
  }, [onNodesChange, getNodes])

  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChange(changes)
    hasChangesRef.current = true
  }, [onEdgesChange])

  const onNodeDragStop = useCallback(() => {
    setHelperLines({})
    takeSnapshot()
  }, [takeSnapshot])

  // Edge reconnection: cầm đầu/đuôi edge để kéo sang node khác
  const edgeReconnectSuccessful = useRef(true)

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els))
      hasChangesRef.current = true
    },
    [setEdges]
  )

  const onReconnectStart = useCallback(() => {
    isReconnecting.current = true
    edgeReconnectSuccessful.current = false
  }, [])

  const onReconnectEnd = useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      // Nếu thả vào vùng trống (không nối được) → giữ nguyên edge cũ
      // Không xóa edge, chỉ reset flag
      edgeReconnectSuccessful.current = true
      // Reset sau 1 tick để onConnectEnd (nếu fire sau) kịp đọc
      setTimeout(() => { isReconnecting.current = false }, 0)
    },
    [setEdges]
  )

  const onPaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      // Only create a node if clicking on the pane background, not on a node or edge
      const target = event.target as Element
      const isPane = target.classList.contains('react-flow__pane') ||
                     target.classList.contains('react-flow__background')

      if (!isPane) return

      event.preventDefault()
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: 'textNode',
        position,
        data: { label: '' },
        style: { width: 200 },
      }

      takeSnapshot()
      setNodes((nds) => [...nds, newNode])
      hasChangesRef.current = true
    },
    [screenToFlowPosition, setNodes, takeSnapshot]
  )

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      // Fallback for double click if onPaneDoubleClick is blocked
      if (event.detail === 2) {
        onPaneDoubleClick(event)
      }
    },
    [onPaneDoubleClick]
  )

  // Add a new node to the center of the viewport
  const addCard = useCallback(() => {
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    })
    
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'textNode',
      position,
      data: { label: '' },
      style: { width: 200 },
    }
    takeSnapshot()
    setNodes((nds) => nds.concat(newNode))
    hasChangesRef.current = true
  }, [screenToFlowPosition, setNodes, takeSnapshot])

  // Ref để theo dõi trạng thái đã lưu gần nhất nhằm so sánh thay đổi thực tế (bao gồm nhập chữ và đổi màu)
  const lastSavedStateRef = useRef<{ nodes: Node[]; edges: Edge[]; title: string } | null>(null)
  
  // Giữ tham chiếu đến state mới nhất cho tác vụ lưu tức thì khi unmount
  const stateRef = useRef({ nodes, edges, title })
  useEffect(() => {
    stateRef.current = { nodes, edges, title }
  }, [nodes, edges, title])

  // Thiết lập trạng thái đã lưu ban đầu khi dữ liệu tải xong
  useEffect(() => {
    if (!loading && lastSavedStateRef.current === null) {
      lastSavedStateRef.current = { nodes, edges, title }
    }
  }, [loading, nodes, edges, title])

  // Tự động lưu dựa trên so sánh thay đổi sâu của state (phát hiện gõ chữ, đổi màu, xóa,...)
  useEffect(() => {
    if (!lastSavedStateRef.current) return

    const currentNodes = nodes
    const currentEdges = edges
    const currentTitle = title

    // So sánh cấu trúc sâu để nhận biết thay đổi thực sự
    const titleChanged = currentTitle !== lastSavedStateRef.current.title
    const nodesChanged = JSON.stringify(currentNodes) !== JSON.stringify(lastSavedStateRef.current.nodes)
    const edgesChanged = JSON.stringify(currentEdges) !== JSON.stringify(lastSavedStateRef.current.edges)

    const hasUnsavedChanges = titleChanged || nodesChanged || edgesChanged

    if (hasUnsavedChanges) {
      hasChangesRef.current = true

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true)
        try {
          await updateCanvas(mindmapId, { nodes: currentNodes, edges: currentEdges, title: currentTitle })
          lastSavedStateRef.current = {
            nodes: currentNodes,
            edges: currentEdges,
            title: currentTitle
          }
          hasChangesRef.current = false
        } catch (err) {
          console.error('Lỗi khi tự động lưu canvas:', err)
        } finally {
          setIsSaving(false)
        }
      }, 1500) // 1.5s debounce
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [nodes, edges, title, mindmapId, setIsSaving, updateCanvas])

  // Cảnh báo người dùng khi tắt tab hoặc tải lại trang nếu có thay đổi chưa lưu
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChangesRef.current) {
        e.preventDefault()
        e.returnValue = 'Bạn có thay đổi chưa lưu trên sơ đồ tư duy. Bạn có chắc muốn rời đi?'
        return e.returnValue
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // Lưu ngay lập tức dữ liệu chưa lưu khi người dùng chuyển trang (unmount component)
  useEffect(() => {
    return () => {
      if (hasChangesRef.current) {
        const { nodes: currentNodes, edges: currentEdges, title: currentTitle } = stateRef.current
        updateCanvas(mindmapId, { nodes: currentNodes, edges: currentEdges, title: currentTitle })
      }
    }
  }, [mindmapId, updateCanvas])

  if (loading) {
    return (
      <div className="w-full h-full bg-white p-6 flex flex-col gap-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-100 rounded-lg"></div>
            <div className="flex flex-col gap-2">
              <div className="w-36 h-4 bg-gray-100 rounded-md"></div>
              <div className="w-20 h-2.5 bg-gray-100 rounded-md"></div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-16 h-7 bg-gray-100 rounded-lg"></div>
            <div className="w-7 h-7 bg-gray-100 rounded-lg"></div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#f5f5f5] w-full"></div>

        {/* Content Skeleton - Mindmap Style */}
        <div className="flex-1 relative bg-white flex items-center justify-center animate-pulse overflow-hidden">
          {/* Node trung tâm */}
          <div className="w-36 h-14 bg-gray-200 rounded-2xl z-10"></div>
          
          {/* Node con 1 (Phía trên bên phải) */}
          <div className="absolute transform translate-x-40 -translate-y-20 w-28 h-10 bg-gray-100 rounded-xl"></div>
          <div className="absolute transform translate-x-20 -translate-y-10 w-20 h-0.5 bg-gray-100"></div> {/* Đường nối */}

          {/* Node con 2 (Phía dưới bên phải) */}
          <div className="absolute transform translate-x-44 translate-y-16 w-24 h-10 bg-gray-100 rounded-xl"></div>
          <div className="absolute transform translate-x-20 translate-y-10 w-20 h-0.5 bg-gray-100 rotate-12"></div> {/* Đường nối */}

          {/* Node con 3 (Phía bên trái) */}
          <div className="absolute transform -translate-x-44 -translate-y-5 w-32 h-10 bg-gray-100 rounded-xl"></div>
          <div className="absolute transform -translate-x-20 -translate-y-2 w-20 h-0.5 bg-gray-100"></div> {/* Đường nối */}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-white flex flex-col relative">
      {/* Header Strip */}
      <header className="w-full flex items-center justify-between px-4 h-[44px] border-b border-border-main bg-background shrink-0 select-none z-10">
        <div className="flex items-center gap-1.5 text-standard tracking-tight text-secondary leading-none">
          {loadingWorkspaceNodes ? (
            <div className="w-40 h-4 bg-gray-200 animate-pulse rounded-md" />
          ) : (
            <>
              <span className="flex items-center leading-none">
                {parentProject ? parentProject.title : 'Tất cả file'}
                <span className="text-zinc-300 mx-1.5 leading-none">/</span>
              </span>
              {isEditingTitle ? (
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (e.nativeEvent.isComposing) return
                      e.preventDefault()
                      e.currentTarget.blur()
                    }
                  }}
                  className="font-medium text-standard-text bg-transparent border-b border-zinc-400 outline-none w-32 focus:w-48 transition-all leading-none"
                  autoFocus
                />
              ) : (
                <span 
                  className="font-medium text-standard-text cursor-pointer hover:text-blue-600 transition-colors leading-none"
                  onClick={() => {
                    setIsEditingTitle(true)
                    setTempTitle(currentCanvasNode?.title || 'Untitled Canvas')
                  }}
                >
                  {currentCanvasNode?.title || 'Untitled Canvas'}
                </span>
              )}
            </>
          )}
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 w-full h-full relative" onDoubleClick={onPaneDoubleClick}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onNodeDragStop={onNodeDragStop}
          onReconnect={onReconnect}
          onReconnectStart={onReconnectStart}
          onReconnectEnd={onReconnectEnd}
          reconnectRadius={20}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          panOnDrag={isPanMode}
          selectionOnDrag={!isPanMode}
          panActivationKeyCode="Space"
          selectionMode={SelectionMode.Partial}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          zoomOnDoubleClick={false}
          className="bg-white"
          minZoom={0.2}
          maxZoom={4}
          proOptions={{ hideAttribution: true }} // Hide watermark for clean UI
        >
          <HelperLinesRenderer horizontal={helperLines.horizontal} vertical={helperLines.vertical} />
          
          <Panel position="top-right" className="m-4 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-gray-200 flex flex-col gap-0.5 z-50">
            <button
              onClick={undo}
              disabled={past.length === 0}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors flex items-center justify-center"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors flex items-center justify-center"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
            
            <div className="w-full h-px bg-gray-100 my-0.5" />
            
            <button
              onClick={() => zoomIn()}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors flex items-center justify-center"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => zoomOut()}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors flex items-center justify-center"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => fitView()}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors flex items-center justify-center"
              title="Fit View"
            >
              <Maximize className="w-4 h-4" />
            </button>
            
            <button
              onClick={onLayout}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors flex items-center justify-center"
              title="Tự động sắp xếp"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            


            <div className="w-full h-px bg-gray-100 my-0.5" />

            <div className="relative" ref={pathMenuRef}>
              <button
                onClick={() => setIsPathMenuOpen(!isPathMenuOpen)}
                className={`p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors flex items-center justify-center ${isPathMenuOpen ? 'bg-gray-100 text-blue-600' : ''}`}
                title="Edge Style"
              >
                <Activity className="w-4 h-4" />
              </button>
              {isPathMenuOpen && (
                <div className="absolute top-0 right-full mr-2 bg-white border border-gray-200 rounded-xl p-1.5 flex flex-col gap-1 z-50 w-36 animate-in fade-in zoom-in slide-in-from-right-2 duration-200">
                  <button onClick={() => updateGlobalPathType('bezier')} className={`px-3 py-2 text-sm rounded-lg text-left transition-colors ${edgePathType === 'bezier' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    Curved
                  </button>
                  <button onClick={() => updateGlobalPathType('smoothstep')} className={`px-3 py-2 text-sm rounded-lg text-left transition-colors ${edgePathType === 'smoothstep' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    Structured
                  </button>
                  <button onClick={() => updateGlobalPathType('straight')} className={`px-3 py-2 text-sm rounded-lg text-left transition-colors ${edgePathType === 'straight' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    Straight
                  </button>
                </div>
              )}
            </div>
          </Panel>
          <style dangerouslySetInnerHTML={{ __html: `

            /* Đưa thanh công cụ và nhãn đường dẫn lên trên các thẻ ghi chú */
            .react-flow__edge-labels-stage {
              z-index: 10000 !important;
              pointer-events: none !important;
            }

            ${!isPanMode ? `
              .react-flow__pane {
                cursor: default !important;
              }
              .react-flow__pane.selection {
                cursor: default !important;
              }
              .react-flow__pane.draggable {
                cursor: grab !important;
              }
              .react-flow__pane.dragging {
                cursor: grabbing !important;
              }
            ` : ''}

            /* Vùng bắt chuột ở 4 góc (kéo cả 2 chiều) */
            .custom-resize-handle {
              width: 24px !important;
              height: 24px !important;
              background: transparent !important;
              border: none !important;
            }

            /* Vùng bắt chuột ở 4 cạnh (kéo 1 chiều) - dùng pseudo-element để mở rộng */
            .custom-resize-line::after {
              content: '';
              position: absolute;
              background: transparent !important;
              z-index: 10;
            }

            .custom-resize-line.top::after {
              top: -10px;
              bottom: 0;
              left: 0;
              right: 0;
            }

            .custom-resize-line.bottom::after {
              bottom: -10px;
              top: 0;
              left: 0;
              right: 0;
            }

            .custom-resize-line.left::after {
              left: -10px;
              right: 0;
              top: 0;
              bottom: 0;
            }

            .custom-resize-line.right::after {
              right: -10px;
              left: 0;
              top: 0;
              bottom: 0;
            }
          ` }} />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1.2} color="#cbd5e1" />



          <Panel position="bottom-center" className="mb-6 flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-gray-200">
            <button
              onClick={addCard}
              className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors flex items-center gap-2 group relative"
              title="Add Card"
            >
              <SquarePlus className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Add Card
              </span>
            </button>
            
            <button
              onClick={() => setIsAddNoteModalOpen(true)}
              className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors flex items-center gap-2 group relative"
              title="Thêm Note"
            >
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Thêm Note
              </span>
            </button>
            
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            
            <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
              <button
                onClick={() => setIsPanMode(false)}
                className={`p-1.5 rounded-md transition-colors relative group ${!isPanMode ? 'bg-white text-blue-600 border border-blue-200' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
                title="Select Mode (V)"
              >
                <MousePointer2 className="w-4 h-4" strokeWidth={2.5} />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Select
                </span>
              </button>
              <button
                onClick={() => setIsPanMode(true)}
                className={`p-1.5 rounded-md transition-colors relative group ${isPanMode ? 'bg-white text-blue-600 border border-blue-200' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
                title="Pan Mode (Space)"
              >
                <Hand className="w-4 h-4" strokeWidth={2.5} />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Pan (Hold Space)
                </span>
              </button>
            </div>
                        {/* Edge Style moved to top-right panel */}

          </Panel>
          
          <Panel position="bottom-right" className="mb-6 mr-6 z-50">
            <button
              onClick={() => setIsLinksPanelOpen(!isLinksPanelOpen)}
              className={`p-2.5 rounded-xl transition-colors bg-white/90 backdrop-blur-md border border-gray-200 flex items-center gap-2 group ${isLinksPanelOpen ? 'text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              title="Liên kết Graph View"
            >
              <Link2 className="w-5 h-5" />
              <span className="text-sm font-medium">Liên kết</span>
            </button>
            
            {isLinksPanelOpen && (
              <div ref={linksPanelRef} className="absolute bottom-full right-0 mb-2 bg-white/95 backdrop-blur-md rounded-xl border border-gray-300 p-4 w-72 max-h-80 flex flex-col z-50 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-800">Liên kết Graph View</h4>
                  <span className="text-xs text-gray-400">{linkedNodeIds.length} đã nối</span>
                </div>
                
                {/* List linked files */}
                <div className="space-y-1.5 max-h-32 overflow-y-auto mb-3 border-b border-gray-100 pb-3">
                  {linkedNodeIds.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-2">Chưa có liên kết nào.</p>
                  ) : (
                    linkedNodeIds.map(id => {
                      const linkedNode = allWorkspaceNodes.find(n => n.id === id)
                      const file = allAvailableFiles.find(f => f.id === id)
                      return (
                        <div key={id} className="flex items-center justify-between text-xs p-2 bg-gray-50/50 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                          <span className="truncate flex-1 mr-2 flex items-center gap-1.5 font-medium text-gray-700">
                            {file?.type === 'note' ? <FileText className="w-3.5 h-3.5 text-gray-400" /> : <Network className="w-3.5 h-3.5 text-gray-400" />}
                            {linkedNode?.title || file?.title || id}
                          </span>
                          <button
                            onClick={() => handleRemoveLink(id)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-white transition-colors"
                            title="Xóa liên kết"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
                
                {/* Add new link */}
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 mb-2">Thêm liên kết mới:</h5>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {allAvailableFiles.filter(f => f.id !== mindmapId && !linkedNodeIds.includes(f.id)).length === 0 ? (
                      <p className="text-xs text-gray-400 italic text-center py-2">Không có file nào khả dụng</p>
                    ) : (
                      allAvailableFiles
                        .filter(f => f.id !== mindmapId && !linkedNodeIds.includes(f.id))
                        .map(f => (
                          <button
                            key={f.id}
                            onClick={() => handleAddLink(f.id)}
                            className="w-full text-left px-2 py-1.5 text-xs rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between group border border-transparent hover:border-gray-100"
                          >
                            <span className="truncate flex-1 flex items-center gap-1.5 text-gray-600 group-hover:text-gray-800">
                              {f.type === 'note' ? <FileText className="w-3.5 h-3.5 text-gray-400" /> : <Network className="w-3.5 h-3.5 text-gray-400" />}
                              {f.title}
                            </span>
                            <Plus className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </Panel>
        </ReactFlow>
        
        {isConnectModalOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center">
            <div className="bg-white rounded-xl border border-gray-300 p-6 w-96 max-w-full">
              <h3 className="text-lg font-bold mb-4">Kết nối với Canvas khác</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableMindmaps.length === 0 ? (
                  <p className="text-sm text-gray-500">Không có canvas nào khác.</p>
                ) : (
                  availableMindmaps.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleConnectToMindmap(m)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">{m.title}</span>
                      <Plus className="w-4 h-4 text-gray-400" />
                    </button>
                  ))
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsConnectModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
        
        {isAddNoteModalOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center">
            <div className="bg-white rounded-xl border border-gray-300 p-6 w-96 max-w-full">
              <h3 className="text-lg font-bold mb-4">Thêm Note vào Canvas</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {existingNotes.length === 0 ? (
                  <p className="text-sm text-gray-500">Không có note nào.</p>
                ) : (
                  existingNotes.map((note) => (
                    <button
                      key={note.id}
                      onClick={async () => {
                        console.log('Thêm Note click - Note ID:', note.id)
                        const noteContent = await db.mind_notes.get(note.id)
                        
                        if (noteContent && allWorkspaceNodes) {
                          const noteNodeInWorkspace = allWorkspaceNodes.find(n => n.note_id === note.id)
                          console.log('Note Node in Workspace:', noteNodeInWorkspace)
                          
                          if (noteNodeInWorkspace && currentCanvasNode) {
                            const updatedLinks = [...linkedNodeIds, noteNodeInWorkspace.id]
                            console.log('Updating links to:', updatedLinks)
                            
                            // Update DB for Graph View
                            await updateNode(currentCanvasNode.id, { connected_node_ids: updatedLinks })
                          }
                          
                          const position = screenToFlowPosition({
                            x: window.innerWidth / 2,
                            y: window.innerHeight / 2,
                          })
                          const newNode: Node = {
                            id: 'node-' + Date.now(),
                            type: 'noteNode',
                            position,
                            data: { 
                              label: noteContent.title,
                              content: noteContent.content,
                              noteId: noteContent.id
                            },
                          }
                          takeSnapshot()
                          setNodes((nds) => nds.concat(newNode))
                          hasChangesRef.current = true
                        }
                        setIsAddNoteModalOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">{note.title}</span>
                      <Plus className="w-4 h-4 text-gray-400" />
                    </button>
                  ))
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
