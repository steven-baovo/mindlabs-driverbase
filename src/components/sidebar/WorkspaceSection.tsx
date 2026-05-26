'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import {
  ChevronRight,
  Plus,
  Trash2,
  FilePlus,
  FolderPlus,
  LayoutGrid,
  GitFork,
  Link as LucideLink,
  Network
} from 'lucide-react'
import { useLocalWorkspace } from '@/lib/local-first/useLocalWorkspace'
import { useLocalNotes } from '@/lib/local-first/useLocalNotes'
import { useLocalCanvas } from '@/lib/local-first/useLocalCanvas'
import { db } from '@/lib/local-first/db'

import { getNodeIconData, buildTree, TreeNode, WorkspaceNode } from '@/lib/node-utils'
import LinkNodeModal from '@/components/workspace/LinkNodeModal'

export default function WorkspaceSection() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { nodes, updateNode, deleteNode, createNode, liveNodesReady } = useLocalWorkspace()
  const { updateNote: updateMindNote } = useLocalNotes()
  const { updateCanvas: updateMindmap } = useLocalCanvas()

  const activeNoteId = searchParams?.get('note')
  const activeCanvasId = searchParams?.get('canvas')
  const activeLinkId = searchParams?.get('link')

  const loading = !liveNodesReady

  // State cho Link Node Modal
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [linkModalData, setLinkModalData] = useState<{
    mode: 'create' | 'edit'
    parentId?: string | null
    nodeId?: string
    title: string
    url: string
  } | null>(null)

  // State cho việc tạo Node mới
  const [creatingParentId, setCreatingParentId] = useState<string | null>(null)

  // State cho việc xóa thư mục (Lựa chọn 1 hoặc 2)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState<WorkspaceNode | null>(null)

  // States cho Kéo & Thả (Drag and Drop)
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null)
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null)

  const [openNodes, setOpenNodes] = useState<Set<string>>(new Set())
  const [isOpenNodesLoaded, setIsOpenNodesLoaded] = useState(false)

  // Đọc openNodes từ localStorage khi mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('project-open-nodes')
      if (saved) {
        const arr = JSON.parse(saved)
        setOpenNodes(new Set(arr))
      }
      setIsOpenNodesLoaded(true)
    }
  }, [])

  // Lưu openNodes vào localStorage khi thay đổi
  useEffect(() => {
    if (isOpenNodesLoaded) {
      localStorage.setItem('project-open-nodes', JSON.stringify(Array.from(openNodes)))
    }
  }, [openNodes, isOpenNodesLoaded])

  // Tự động mở các thư mục cha của file đang active trên sidebar cây thư mục
  useEffect(() => {
    if (nodes.length > 0 && (activeNoteId || activeCanvasId || activeLinkId)) {
      const activeNode = nodes.find(n => n.note_id === activeNoteId || n.map_id === activeCanvasId || n.id === activeLinkId)
      if (activeNode && activeNode.parent_id) {
        setOpenNodes(prev => {
          const next = new Set(prev)
          let currParentId = activeNode.parent_id
          while (currParentId) {
            next.add(currParentId)
            const parentNode = nodes.find(n => n.id === currParentId)
            currParentId = parentNode?.parent_id || null
          }
          return next
        })
      }
    }
  }, [nodes, activeNoteId, activeCanvasId, activeLinkId])


  const projectTree = useMemo(() => {
    return buildTree(nodes)
  }, [nodes])

  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newType, setNewType] = useState<'folder' | 'note' | 'map' | 'link'>('folder')

  // State cho việc gắn Note có sẵn
  const [existingNotes, setExistingNotes] = useState<{ id: string, title: string }[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string>('')
  const [isLinkingExisting, setIsLinkingExisting] = useState(false)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ mouseX: number, mouseY: number, nodeId: string } | null>(null)

  useEffect(() => {
    const fetchExistingNotes = async () => {
      const data = await db.mind_notes.toArray()
      if (data) {
        setExistingNotes(data.map(n => ({ id: n.id, title: n.title })))
      }
    }
    fetchExistingNotes()
  }, [])

  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  const toggleNode = (id: string) => {
    setOpenNodes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectNote = (noteId: string) => {
    router.push(`/workspace?note=${noteId}`)
  }
  const handleSelectCanvas = (mapId: string) => {
    router.push(`/workspace?canvas=${mapId}`)
  }
  const handleSelectLink = (linkId: string) => {
    router.push(`/workspace?link=${linkId}`)
  }

  const handleLinkModalSubmit = async (title: string, url: string) => {
    if (!linkModalData) return

    if (linkModalData.mode === 'create') {
      const parentId = linkModalData.parentId ?? null
      const { data, error } = await createNode({
        title: title,
        type: 'link',
        url: url,
        parent_id: parentId,
        order: Math.max(...nodes.filter(n => n.parent_id === parentId).map(n => n.order || 0), -1) + 1
      })

      if (error) {
        alert(`Lỗi tạo link: ${error}`)
      } else if (data) {
        setCreatingParentId(null)
        handleSelectLink(data.id)
      }
    } else if (linkModalData.mode === 'edit' && linkModalData.nodeId) {
      const nodeId = linkModalData.nodeId
      try {
        await updateNode(nodeId, { title, url })
      } catch (err: any) {
        alert(`Lỗi khi sửa link: ${err.message}`)
      }
    }
  }

  const handleCreateNodeDirect = async (parentId: string | null, type: 'folder' | 'note' | 'map' | 'link') => {
    const defaultTitle = type === 'folder' ? 'Untitled Folder' : type === 'note' ? 'Untitled Note' : type === 'map' ? 'Untitled Canvas' : 'Untitled Link'

    if (type === 'link') {
      setLinkModalData({
        mode: 'create',
        parentId: parentId,
        title: '',
        url: ''
      })
      setLinkModalOpen(true)
      return
    }

    const { data, error } = await createNode({
      title: defaultTitle,
      type: type,
      url: null,
      parent_id: parentId,
      order: Math.max(...nodes.filter(n => n.parent_id === parentId).map(n => n.order || 0), -1) + 1
    })

    if (error) {
      alert(`Lỗi tạo node: ${error}`)
    } else if (data) {
      setCreatingParentId(null)
      setEditingNodeId(data.id)
      
      // Tự động mở folder cha
      if (parentId) {
        setOpenNodes(prev => {
          const next = new Set(prev)
          next.add(parentId)
          return next
        })
      }

      if (type === 'note' && data.note_id) {
        handleSelectNote(data.note_id)
      } else if (type === 'map' && data.map_id) {
        handleSelectCanvas(data.map_id)
      }
    }
  }

  const handleDeleteNode = async (id: string) => {
    const node = nodes.find(n => n.id === id)
    if (!node) return

    const hasChildren = nodes.some(n => n.parent_id === id)

    if (node.type === 'folder' && hasChildren) {
      setNodeToDelete(node)
      setDeleteModalOpen(true)
      return
    }

    if (confirm(`Bạn có chắc chắn muốn xóa ${node.type === 'folder' ? 'thư mục' : 'file'} này?`)) {
      const { error } = await deleteNode(id)
      if (error) {
        alert(`Lỗi xóa: ${error}`)
      }
    }
  }

  const handleNodeDrop = async (draggedId: string, targetParentId: string | null) => {
    if (!draggedId) return
    
    if (draggedId === targetParentId) return

    if (targetParentId) {
      const targetNode = nodes.find(n => n.id === targetParentId)
      if (!targetNode || targetNode.type !== 'folder') return
      
      const draggedNode = nodes.find(n => n.id === draggedId)
      if (draggedNode && draggedNode.type === 'folder') {
        const isDescendant = (parentId: string, childId: string): boolean => {
          let curr = nodes.find(n => n.id === childId)
          while (curr && curr.parent_id) {
            if (curr.parent_id === parentId) return true
            const nextParentId = curr.parent_id
            curr = nodes.find(n => n.id === nextParentId)
          }
          return false
        }
        if (isDescendant(draggedId, targetParentId)) {
          alert('Không thể kéo thư mục cha vào thư mục con của chính nó!')
          return
        }
      }
    }
    
    try {
      const newOrder = Math.max(...nodes.filter(n => n.parent_id === targetParentId).map(n => n.order || 0), -1) + 1
      await updateNode(draggedId, { parent_id: targetParentId, order: newOrder })
      if (targetParentId && !openNodes.has(targetParentId)) {
        toggleNode(targetParentId)
      }
    } catch (err: any) {
      alert(`Lỗi khi di chuyển file: ${err.message}`)
    }
  }

  // Cung cấp context nội bộ
  const sidebarContextValue = {
    openNodes,
    activeNoteId,
    activeCanvasId,
    activeLinkId,
    editingNodeId,
    creatingParentId,
    setEditingNodeId,
    setCreatingParentId,
    setNewType,
    setIsLinkingExisting,
    updateNode,
    updateMindNote,
    updateMindmap,
    handleDeleteNode,
    handleCreateNodeDirect,
    setContextMenu,
    toggleNode,
    onSelectNote: handleSelectNote,
    onSelectCanvas: handleSelectCanvas,
    onSelectLink: handleSelectLink,
    draggedNodeId,
    dragOverNodeId,
    setDraggedNodeId,
    setDragOverNodeId,
    handleNodeDrop
  }

  return (
    <>
      <div className="flex-1 flex flex-col pt-0 px-0 relative group/sidebar min-h-0">
        <div className="h-[44px] border-b border-border-main bg-transparent shrink-0 flex items-center justify-between select-none px-1">
          {/* Nhóm 1: Thêm mới */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleCreateNodeDirect(null, 'note')}
              className="p-1.5 hover:bg-hover-bg rounded-lg text-secondary hover:text-foreground transition-colors cursor-pointer flex items-center justify-center"
              title="Tạo Note mới"
            >
              <FilePlus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleCreateNodeDirect(null, 'map')}
              className="p-1.5 hover:bg-hover-bg rounded-lg text-secondary hover:text-foreground transition-colors cursor-pointer flex items-center justify-center"
              title="Tạo Canvas mới"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleCreateNodeDirect(null, 'link')}
              className="p-1.5 hover:bg-hover-bg rounded-lg text-secondary hover:text-foreground transition-colors cursor-pointer flex items-center justify-center"
              title="Tạo Liên kết mới"
            >
              <LucideLink className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleCreateNodeDirect(null, 'folder')}
              className="p-1.5 hover:bg-hover-bg rounded-lg text-secondary hover:text-foreground transition-colors cursor-pointer flex items-center justify-center"
              title="Tạo Thư mục mới"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Nhóm 2: Góc nhìn */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push('/workspace?view=graph')}
              className="p-1.5 hover:bg-hover-bg rounded-lg text-secondary hover:text-foreground transition-colors cursor-pointer flex items-center justify-center"
              title="Xem Graph View"
            >
              <Network className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/workspace')}
              className="p-1.5 hover:bg-hover-bg rounded-lg text-secondary hover:text-foreground transition-colors cursor-pointer flex items-center justify-center"
              title="Xem Sơ đồ Cấu trúc"
            >
              <GitFork className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div 
          onDragOver={(e) => {
            if (draggedNodeId) {
              e.preventDefault()
            }
          }}
          onDrop={async (e) => {
            if (draggedNodeId) {
              e.preventDefault()
              await handleNodeDrop(draggedNodeId, null)
              setDraggedNodeId(null)
            }
          }}
          className="flex-1 overflow-y-auto no-scrollbar pt-3 flex flex-col gap-0.5"
        >
          {loading ? (
            <div className="space-y-2 animate-pulse mt-2">
              <div className="flex items-center gap-2 p-1.5">
                <div className="w-3.5 h-3.5 bg-active-bg/50 rounded"></div>
                <div className="w-3/4 h-3 bg-active-bg/50 rounded"></div>
              </div>
              <div className="flex items-center gap-2 p-1.5">
                <div className="w-3.5 h-3.5 bg-active-bg/50 rounded"></div>
                <div className="w-1/2 h-3 bg-active-bg/50 rounded"></div>
              </div>
              <div className="flex items-center gap-2 p-1.5">
                <div className="w-3.5 h-3.5 bg-active-bg/50 rounded"></div>
                <div className="w-2/3 h-3 bg-active-bg/50 rounded"></div>
              </div>
            </div>
          ) : projectTree.length === 0 ? (
            <div className="text-center text-xs text-secondary/50 mt-4">Chưa có file nào trong dự án</div>
          ) : (
            <SidebarContext.Provider value={sidebarContextValue as any}>
              {projectTree.map(node => (
                <RenderNode key={node.id} node={node} level={0} />
              ))}
            </SidebarContext.Provider>
          )}
        </div>
      </div>

      {contextMenu && (() => {
        const node = nodes.find(n => n.id === contextMenu.nodeId)
        const hasChildren = nodes.some(n => n.parent_id === contextMenu.nodeId)
        const isFolderWithChildren = node?.type === 'folder' && hasChildren

        return (
          <div
            className="fixed bg-surface border border-border-main rounded-lg py-1 z-[1000] w-48 animate-in fade-in zoom-in-95 duration-100 shadow-overlay"
            style={{ top: contextMenu.mouseY, left: contextMenu.mouseX }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setEditingNodeId(contextMenu.nodeId)
                setContextMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-hover-bg flex items-center gap-2 text-foreground"
            >
              <Plus className="w-3.5 h-3.5 text-secondary" /> Đổi tên
            </button>

            {node?.type === 'link' && (
              <button
                onClick={() => {
                  setLinkModalData({
                    mode: 'edit',
                    nodeId: node.id,
                    title: node.title,
                    url: node.url || ''
                  })
                  setLinkModalOpen(true)
                  setContextMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-hover-bg flex items-center gap-2 text-foreground border-t border-border-main"
              >
                <LucideLink className="w-3.5 h-3.5 text-secondary" /> Sửa tiêu đề & URL
              </button>
            )}

            {isFolderWithChildren ? (
              <>
                <div className="border-t border-border-main my-1"></div>
                <div className="px-3 py-1 text-[10px] text-secondary font-medium">Lựa chọn xóa:</div>
                <button
                  onClick={async () => {
                    const children = nodes.filter(n => n.parent_id === node.id)
                    setContextMenu(null)

                    for (const child of children) {
                      await updateNode(child.id, { parent_id: null })
                    }
                    await deleteNode(node.id)
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-hover-bg flex flex-col gap-0.5 text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5 text-secondary" strokeWidth={1.5} /> 
                    <span>Chỉ xóa thư mục</span>
                  </div>
                  <span className="text-[10px] text-secondary/60 ml-5">Giữ lại file con đẩy ra ngoài</span>
                </button>

                <button
                  onClick={async () => {
                    setContextMenu(null)
                    await deleteNode(node.id)
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-500/10 text-red-500 flex flex-col gap-0.5"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" strokeWidth={1.5} /> 
                    <span>Xóa toàn bộ</span>
                  </div>
                  <span className="text-[10px] text-red-450 ml-5">Xóa sạch thư mục và file con</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  handleDeleteNode(contextMenu.nodeId)
                  setContextMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-500/10 text-red-500 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Xóa
              </button>
            )}
          </div>
        )
      })()}

      <LinkNodeModal
        isOpen={linkModalOpen}
        onClose={() => {
          setLinkModalOpen(false)
          setLinkModalData(null)
        }}
        onSubmit={handleLinkModalSubmit}
        initialTitle={linkModalData?.title || ''}
        initialUrl={linkModalData?.url || ''}
        mode={linkModalData?.mode || 'create'}
      />

      {deleteModalOpen && nodeToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg shadow-overlay border border-border-main p-6 w-[400px]">
            <h3 className="text-lg font-medium mb-2 text-foreground">Xóa thư mục</h3>
            <p className="text-sm text-secondary mb-6 leading-relaxed">
              Thư mục <strong>{nodeToDelete.title}</strong> đang chứa các file/thư mục con. Bạn có chắc chắn muốn xóa thư mục này và toàn bộ nội dung bên trong không?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false)
                  setNodeToDelete(null)
                }}
                className="px-4 py-2 text-sm font-medium text-secondary bg-active-bg hover:bg-hover-bg rounded border border-border-main transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  const { error } = await deleteNode(nodeToDelete.id)
                  if (error) {
                    alert(`Lỗi xóa: ${error}`)
                  }
                  setDeleteModalOpen(false)
                  setNodeToDelete(null)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const SidebarContext = React.createContext<any>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error('useSidebar must be used within a SidebarProvider')
  return context
}

const NodeTitleText = React.memo(({ node, isActive }: { node: TreeNode; isActive: boolean }) => {
  const { activeId, title: activeContextTitle } = useWorkspace()
  const displayTitle = (isActive && activeId === node.note_id && activeContextTitle) ? activeContextTitle : node.title
  return <span className="truncate flex-1">{displayTitle}</span>
})
NodeTitleText.displayName = 'NodeTitleText'

const RenderNode = React.memo(({ node, level }: { node: TreeNode; level: number }) => {
  const {
    openNodes,
    activeNoteId,
    activeCanvasId,
    activeLinkId,
    editingNodeId,
    creatingParentId,
    setEditingNodeId,
    setCreatingParentId,
    setNewType,
    setIsLinkingExisting,
    updateNode,
    updateMindNote,
    updateMindmap,
    handleDeleteNode,
    handleCreateNodeDirect,
    setContextMenu,
    toggleNode,
    onSelectNote,
    onSelectCanvas,
    onSelectLink,
    draggedNodeId,
    dragOverNodeId,
    setDraggedNodeId,
    setDragOverNodeId,
    handleNodeDrop
  } = useSidebar()

  const { icon: Icon, color } = getNodeIconData(node.type, node.url)
  const isOpen = openNodes.has(node.id)
  const isActive = (node.type === 'note' && node.note_id === activeNoteId) ||
                   (node.type === 'map' && node.map_id === activeCanvasId) ||
                   (node.type === 'link' && node.id === activeLinkId)

  const isActiveNote = node.type === 'note' && node.note_id === activeNoteId
  const isDragOver = dragOverNodeId === node.id && node.type === 'folder' && draggedNodeId !== node.id

  const isDraggingRef = React.useRef(false)

  return (
    <div className="flex flex-col gap-0.5">
      <div
        draggable={true}
        onMouseDown={() => {
          isDraggingRef.current = false
        }}
        onDragStart={(e) => {
          e.stopPropagation()
          isDraggingRef.current = true
          setDraggedNodeId(node.id)
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', node.id)
        }}
        onDragEnd={() => {
          isDraggingRef.current = false
          setDraggedNodeId(null)
          setDragOverNodeId(null)
        }}
        onDragOver={(e) => {
          if (node.type === 'folder' && draggedNodeId && draggedNodeId !== node.id) {
            e.preventDefault()
            e.stopPropagation()
            setDragOverNodeId(node.id)
          }
        }}
        onDragLeave={(e) => {
          if (node.type === 'folder') {
            e.stopPropagation()
            setDragOverNodeId(null)
          }
        }}
        onDrop={async (e) => {
          if (node.type === 'folder' && draggedNodeId) {
            e.preventDefault()
            e.stopPropagation()
            setDragOverNodeId(null)
            await handleNodeDrop(draggedNodeId, node.id)
            setDraggedNodeId(null)
          }
        }}
        className={`flex items-center gap-2 p-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-all group select-none
          ${isActive 
            ? 'bg-primary/5 text-primary font-bold border-l-2 border-primary rounded-l-none' 
            : 'text-secondary hover:text-foreground hover:bg-hover-bg'}
          ${isDragOver ? 'bg-blue-50/70 border border-blue-500' : ''}
          ${level === 0 ? 'text-[13px]' : 'text-[12px]'}
        `}
        style={{ marginLeft: level > 0 ? `${level * 12}px` : '0' }}
        onClick={() => {
          if (isDraggingRef.current) return
          if (node.type === 'folder') {
            toggleNode(node.id)
          } else if (node.type === 'note' && node.note_id) {
            onSelectNote(node.note_id)
          } else if (node.type === 'map' && node.map_id) {
            onSelectCanvas(node.map_id)
          } else if (node.type === 'link') {
            onSelectLink(node.id)
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setContextMenu({
            mouseX: e.clientX,
            mouseY: e.clientY,
            nodeId: node.id
          })
        }}
      >
        {node.type === 'folder' ? (
          <ChevronRight className={`w-3 h-3 transition-transform text-secondary/30 ${isOpen ? 'rotate-90' : ''}`} />
        ) : (
          <div className="w-3" />
        )}
        <Icon className={`w-3.5 h-3.5 ${color}`} strokeWidth={1.5} />
        {editingNodeId === node.id ? (
          <input
            type="text"
            defaultValue={node.title}
            className="flex-1 bg-surface border border-blue-500 rounded px-1 text-xs outline-none text-foreground"
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.nativeEvent.isComposing) return
                e.preventDefault()
                e.currentTarget.blur()
              } else if (e.key === 'Escape') {
                setEditingNodeId(null)
              }
            }}
            onBlur={async (e) => {
              const title = e.currentTarget.value.trim()
              if (!title || title === node.title) {
                setEditingNodeId(null)
                return
              }
              e.currentTarget.disabled = true
              try {
                await updateNode(node.id, { title })
                if (node.type === 'note' && node.note_id) {
                  await updateMindNote(node.note_id, { title })
                } else if (node.type === 'map' && node.map_id) {
                  await updateMindmap(node.map_id, { title })
                }
              } catch (err: any) {
                alert(`Lỗi khi đổi tên: ${err.message}`)
              } finally {
                setEditingNodeId(null)
              }
            }}
          />
        ) : (
          <NodeTitleText node={node} isActive={isActiveNote} />
        )}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
          {node.type === 'folder' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setCreatingParentId(node.id)
                setNewType('folder')
                setIsLinkingExisting(false)
                if (!isOpen) {
                  toggleNode(node.id)
                }
              }}
              className="p-1 hover:bg-hover-bg rounded"
              title="Thêm node con"
            >
              <Plus className="w-3 h-3 text-secondary" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteNode(node.id)
            }}
            className="p-1 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded"
            title="Xóa"
          >
            <Trash2 className="w-3 h-3 text-red-500" />
          </button>
        </div>
      </div>
      {creatingParentId === node.id && (
        <div className="ml-6 mb-2 px-1 flex items-center justify-start gap-1 border-b border-border-main/50 pb-2 text-[10px]">
          <button onClick={() => handleCreateNodeDirect(node.id, 'note')} className="p-1 hover:bg-hover-bg rounded text-secondary hover:text-foreground transition-colors">Note</button>
          <button onClick={() => handleCreateNodeDirect(node.id, 'map')} className="p-1 hover:bg-hover-bg rounded text-secondary hover:text-foreground transition-colors">Canvas</button>
          <button onClick={() => handleCreateNodeDirect(node.id, 'link')} className="p-1 hover:bg-hover-bg rounded text-secondary hover:text-foreground transition-colors">Link</button>
          <button onClick={() => handleCreateNodeDirect(node.id, 'folder')} className="p-1 hover:bg-hover-bg rounded text-secondary hover:text-foreground transition-colors">Folder</button>
          <button onClick={() => setCreatingParentId(null)} className="p-1 bg-active-bg hover:bg-hover-bg rounded ml-auto text-secondary">Hủy</button>
        </div>
      )}
      {isOpen && node.children.map(child => (
        <RenderNode key={child.id} node={child} level={level + 1} />
      ))}
    </div>
  )
})
RenderNode.displayName = 'RenderNode'
