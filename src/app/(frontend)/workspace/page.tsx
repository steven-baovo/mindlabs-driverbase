'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProjectSidebar from '@/components/workspace/ProjectSidebar'
import NoteEditorClient from '@/components/mindnote/NoteEditorClient'
import MindmapOverview from '@/components/workspace/MindmapOverview'
import ConnectNodeModal from '@/components/workspace/ConnectNodeModal'
import { WorkspaceNode } from '@/lib/local-first/db'
import { checkUrlEmbeddable } from '@/app/actions'
import { useLocalWorkspace } from '@/lib/local-first/useLocalWorkspace'
import { triggerSync } from '@/lib/local-first/sync-engine'
import { db } from '@/lib/local-first/db'
import dynamic from 'next/dynamic'
import { ReactFlowProvider } from '@xyflow/react'
import MindmapBoard from '@/components/mindmap/MindmapBoard'
import { Link as LucideLink, ShieldAlert, ExternalLink, Loader2 } from 'lucide-react'

const GraphView = dynamic(() => import('@/components/workspace/GraphView'), {
  ssr: false,
  loading: () => <div className="text-xs text-secondary/50 flex-1 flex items-center justify-center">Đang tải Graph View...</div>
})

function WorkspaceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const noteParam = searchParams?.get('note')
  const canvasParam = searchParams?.get('canvas')
  const linkParam = searchParams?.get('link')

  const { nodes, updateNode, liveNodesReady } = useLocalWorkspace()
  const [loading, setLoading] = useState(false)

  // Tự động đồng bộ dữ liệu mới nhất từ Supabase khi người dùng truy cập
  useEffect(() => {
    let timer: NodeJS.Timeout
    async function syncOnMount() {
      const count = await db.workspace_nodes.count()
      if (count === 0) {
        setLoading(true)
        await triggerSync()
        setLoading(false)
      } else {
        // Đồng bộ ngầm để người dùng nhận ngay các cập nhật từ thiết bị khác mà không gây gián đoạn UI
        // Trì hoãn 2 giây để ưu tiên hiển thị UI cực nhanh từ DB local (< 5ms)
        timer = setTimeout(() => {
          triggerSync()
        }, 2000)
      }
    }
    syncOnMount()
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [])

  const fetchProjectNodes = async (silent = false) => {
    if (!silent) {
      setLoading(true)
      await triggerSync()
      setLoading(false)
    }
  }

  // State cho việc mở Note, Canvas, Link, Graph View
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null)
  const [activeLinkId, setActiveLinkId] = useState<string | null>(null)
  const [showGraphView, setShowGraphView] = useState(false)

  // State cho việc mở Modal kết nối
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)

  // State quản lý các node đang mở ở Sidebar
  const [openNodes, setOpenNodes] = useState<Set<string>>(new Set())
  const [isOpenNodesLoaded, setIsOpenNodesLoaded] = useState(false)

  // Đồng bộ URL search params với active states
  useEffect(() => {
    if (noteParam) {
      setActiveNoteId(noteParam)
      setActiveCanvasId(null)
      setActiveLinkId(null)
      setShowGraphView(false)
    } else if (canvasParam) {
      setActiveNoteId(null)
      setActiveCanvasId(canvasParam)
      setActiveLinkId(null)
      setShowGraphView(false)
    } else if (linkParam) {
      setActiveNoteId(null)
      setActiveCanvasId(null)
      setActiveLinkId(linkParam)
      setShowGraphView(false)
    } else {
      setActiveNoteId(null)
      setActiveCanvasId(null)
      setActiveLinkId(null)
    }
  }, [noteParam, canvasParam, linkParam])

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

  // Sử dụng toàn bộ các node để vẽ sơ đồ tổng quan
  const globalTreeNodes = useMemo(() => {
    return nodes
  }, [nodes])

  const handleSelectNote = (noteId: string) => {
    setActiveNoteId(noteId)
    setActiveCanvasId(null)
    setShowGraphView(false)
    router.replace(`/workspace?note=${noteId}`)
  }

  const handleSelectCanvas = (mapId: string) => {
    setActiveNoteId(null)
    setActiveCanvasId(mapId)
    setActiveLinkId(null)
    setShowGraphView(false)
    router.replace(`/workspace?canvas=${mapId}`)
  }

  const handleSelectLink = (linkId: string) => {
    setActiveNoteId(null)
    setActiveCanvasId(null)
    setActiveLinkId(linkId)
    setShowGraphView(false)
    router.replace(`/workspace?link=${linkId}`)
  }

  return (
    <div className="flex h-full w-full bg-transparent p-[4px] gap-[4px]">
      {/* Cột 2: Project Sidebar */}
      <ProjectSidebar
        nodes={nodes}
        setNodes={undefined}
        loading={loading || !liveNodesReady}
        onRefetch={fetchProjectNodes}
        onSelectNote={handleSelectNote}
        onShowOverview={() => {
          setActiveNoteId(null)
          setActiveCanvasId(null)
          setActiveLinkId(null)
          setShowGraphView(false)
          router.replace(`/workspace`)
        }}
        onShowGraphView={() => {
          setActiveNoteId(null)
          setActiveCanvasId(null)
          setActiveLinkId(null)
          setShowGraphView(true)
          router.replace(`/workspace`)
        }}
        onSelectCanvas={handleSelectCanvas}
        onSelectLink={handleSelectLink}
        openNodes={openNodes}
        onToggleNode={(id) => {
          setOpenNodes(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
          })
        }}
        activeNoteId={activeNoteId}
        activeCanvasId={activeCanvasId}
        activeLinkId={activeLinkId}
      />

      {/* Cột 3: Vùng làm việc chính */}
      <main className="flex-1 bg-white flex flex-col relative overflow-hidden rounded-default border border-border-main">
        {activeNoteId ? (
          <div className="w-full h-full relative overflow-auto no-scrollbar">
            <NoteEditorClient
              key={activeNoteId}
              noteId={activeNoteId}
              onOpenConnectModal={() => setIsConnectModalOpen(true)}
            />
          </div>
        ) : activeCanvasId ? (
          <div className="w-full h-full relative">
            <ReactFlowProvider>
              <MindmapBoard
                mindmapId={activeCanvasId}
              />
            </ReactFlowProvider>
          </div>
        ) : activeLinkId ? (
          <div className="w-full h-full relative">
            <LinkEmbedPreview
              nodeId={activeLinkId}
              nodes={nodes}
            />
          </div>
        ) : showGraphView ? (
          <GraphView nodes={nodes} />
        ) : (
          /* Render Mindmap View */
          <MindmapOverview
            nodes={globalTreeNodes}
            onRefetch={fetchProjectNodes}
            onNodeCreated={(parentId) => {
              setOpenNodes(prev => {
                const next = new Set(prev)
                next.add(parentId)
                return next
              })
            }}
            onSelectNote={handleSelectNote}
            onSelectCanvas={handleSelectCanvas}
            onSelectLink={handleSelectLink}
          />
        )}
      </main>

      {/* Modal Kết nối Node */}
      <ConnectNodeModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        nodes={nodes}
        onSelect={async (targetId) => {
          const currentNode = nodes.find(n => n.note_id === activeNoteId || n.map_id === activeCanvasId)
          if (!currentNode) {
            alert('Không tìm thấy node hiện tại để kết nối!')
            return
          }

          const currentConnections = currentNode.connected_node_ids || []
          if (currentConnections.includes(targetId)) {
            alert('Node này đã được kết nối từ trước!')
            return
          }

          // 1. Cập nhật node hiện tại (A -> B)
          const updatedConnections = [...currentConnections, targetId]
          const { error: errorA } = await updateNode(currentNode.id, { connected_node_ids: updatedConnections })

          if (errorA) {
            alert(`Lỗi khi lưu kết nối: ${errorA}`)
            return
          }

          // 2. Cập nhật node đích (B -> A) để tạo liên kết 2 chiều
          const targetNode = nodes.find(n => n.id === targetId)
          if (targetNode) {
            const targetConnections = targetNode.connected_node_ids || []
            if (!targetConnections.includes(currentNode.id)) {
               await updateNode(targetId, { connected_node_ids: [...targetConnections, currentNode.id] })
            }
          }

          alert('Đã tạo kết nối 2 chiều thành công!')
          fetchProjectNodes() // Tải lại dữ liệu để cập nhật state
          setIsConnectModalOpen(false)
        }}
        currentNodeId={nodes.find(n => n.note_id === activeNoteId || n.map_id === activeCanvasId)?.id || ''}
        alreadyConnectedIds={nodes.find(n => n.note_id === activeNoteId || n.map_id === activeCanvasId)?.connected_node_ids || []}
      />
    </div>
  )
}

function LinkEmbedPreview({ nodeId, nodes }: { nodeId: string, nodes: WorkspaceNode[] }) {
  const node = nodes.find(n => n.id === nodeId)
  const [iframeKey, setIframeKey] = useState(0)
  const [isChecking, setIsChecking] = useState(true)
  const [isEmbeddable, setIsEmbeddable] = useState<boolean | null>(null)
  const [forceEmbed, setForceEmbed] = useState(false)

  if (!node) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-secondary/40 text-xs gap-2">
        <span>Không tìm thấy thông tin liên kết này</span>
      </div>
    )
  }

  let formattedUrl = node.url || ''
  if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://') && !formattedUrl.startsWith('/')) {
    formattedUrl = `https://${formattedUrl}`
  }

  useEffect(() => {
    if (!formattedUrl) {
      setIsChecking(false)
      setIsEmbeddable(null)
      return
    }

    setIsChecking(true)
    setIsEmbeddable(null)
    setForceEmbed(false)

    checkUrlEmbeddable(formattedUrl)
      .then(({ embeddable }) => {
        setIsEmbeddable(embeddable)
        setIsChecking(false)
      })
      .catch(() => {
        setIsEmbeddable(false)
        setIsChecking(false)
      })
  }, [formattedUrl, iframeKey])

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1)
  }

  const handleOpenNewTab = () => {
    if (formattedUrl) {
      window.open(formattedUrl, '_blank')
    }
  }

  const hostName = useMemo(() => {
    try {
      if (!formattedUrl) return ''
      const urlObj = new URL(formattedUrl)
      return urlObj.hostname
    } catch {
      return formattedUrl
    }
  }, [formattedUrl])

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fafafa]">
      <div className="flex-1 relative flex flex-col h-full min-h-0">
        {!formattedUrl ? (
          <div className="flex-1 m-4 p-6 bg-white border border-border-main/50 rounded-2xl flex flex-col items-center justify-center text-center">
            <LucideLink className="w-10 h-10 text-secondary/30 mb-2 animate-bounce" />
            <h3 className="text-sm font-bold text-foreground mb-1">Chưa có liên kết URL</h3>
            <p className="text-xs text-secondary/50 max-w-sm mb-4">Nhấp chuột phải vào tên liên kết này ở thanh bên, chọn "Sửa tiêu đề & URL Link" để thêm địa chỉ web của bạn.</p>
          </div>
        ) : isChecking ? (
          <div className="flex-1 m-4 p-6 bg-white border border-border-main/50 rounded-2xl flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <h3 className="text-sm font-bold text-foreground mb-1">Đang kiểm tra bảo mật trang web...</h3>
            <p className="text-xs text-secondary/40 max-w-xs">Xác minh khả năng hiển thị trực tiếp để mang lại trải nghiệm tối ưu.</p>
          </div>
        ) : (isEmbeddable || forceEmbed) ? (
          <div className="flex-1 bg-white overflow-hidden flex flex-col relative h-full w-full">
            <div className="absolute top-3 right-3 z-50 flex items-center gap-1.5">
              <button
                onClick={handleRefresh}
                className="p-2 bg-white/80 backdrop-blur-md hover:bg-white text-secondary/70 hover:text-foreground border border-border-main/50 rounded-xl transition-all duration-150 cursor-pointer"
                title="Tải lại trang"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
                </svg>
              </button>
              <button
                onClick={handleOpenNewTab}
                className="flex items-center gap-0 hover:gap-1.5 px-2 py-2 hover:px-3 bg-white/80 backdrop-blur-md hover:bg-white text-secondary/70 hover:text-primary border border-border-main/50 rounded-xl transition-all duration-300 ease-in-out cursor-pointer group"
                title="Mở trong tab mới"
              >
                <ExternalLink className="w-3.5 h-3.5 text-secondary/70 group-hover:text-primary transition-colors" />
                <span className="max-w-0 overflow-hidden whitespace-nowrap text-[11px] font-bold text-primary transition-all duration-300 ease-in-out group-hover:max-w-[80px]">
                  Mở tab mới
                </span>
              </button>
            </div>

            <iframe
              key={iframeKey}
              src={formattedUrl}
              className="flex-1 w-full h-full border-none bg-white"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              title={node.title}
            />
          </div>
        ) : (
          <div className="flex-1 m-4 bg-white border border-border-main/50 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-white to-gray-50/50">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-5 border border-amber-100/50 animate-pulse">
              <ShieldAlert className="w-8 h-8 text-amber-500" strokeWidth={1.8} />
            </div>
            
            <h3 className="text-base font-extrabold text-secondary mb-2">Không thể xem trực tiếp trang web</h3>
            
            <p className="text-xs text-secondary/60 max-w-md leading-relaxed mb-6">
              Để bảo vệ quyền riêng tư và thông tin của bạn, trang web <strong className="text-secondary font-bold">{hostName}</strong> từ chối hiển thị nội dung của họ bên trong các ứng dụng khác (qua chính sách bảo mật X-Frame-Options/CSP).
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <button
                onClick={handleOpenNewTab}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-white bg-primary hover:bg-primary/95 rounded-xl transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
              >
                <span>Mở trong tab mới</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={() => setForceEmbed(true)}
                className="w-full sm:w-auto px-4 py-3 text-xs font-semibold text-secondary hover:bg-gray-100 rounded-xl transition-all duration-150 border border-border-main/50 cursor-pointer"
              >
                Vẫn cố thử nhúng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={
      <div className="flex-1 h-full flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    }>
      <WorkspaceContent />
    </Suspense>
  )
}
