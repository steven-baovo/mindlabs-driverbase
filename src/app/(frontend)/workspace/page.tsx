'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import NoteEditorClient from '@/components/mindnote/NoteEditorClient'
import MindmapOverview from '@/components/workspace/MindmapOverview'
import WorkspaceHome from '@/components/workspace/WorkspaceHome'
import ConnectNodeModal from '@/components/workspace/ConnectNodeModal'
import { WorkspaceNode } from '@/lib/local-first/db'
import { checkUrlEmbeddable } from '@/app/actions'
import { useLocalWorkspace } from '@/lib/local-first/useLocalWorkspace'
import { triggerSync } from '@/lib/local-first/sync-engine'
import { db } from '@/lib/local-first/db'
import dynamic from 'next/dynamic'
import { ReactFlowProvider } from '@xyflow/react'
import MindmapBoard from '@/components/mindmap/MindmapBoard'
import { Link as LucideLink, ShieldAlert, ExternalLink, Loader2, GitFork, Share2 } from 'lucide-react'

const GraphView = dynamic(() => import('@/components/workspace/GraphView'), {
  ssr: false,
  loading: () => <div className="text-xs text-secondary/50 flex-1 flex items-center justify-center">Đang tải Graph View...</div>
})

function WorkspaceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { selection, selectNote, selectCanvas, selectLink, selectGraphView, clearSelection } = useWorkspace()

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

  const activeNoteId = selection.noteId
  const activeCanvasId = selection.canvasId
  const activeLinkId = selection.linkId
  const showGraphView = selection.graphView
  const [graphMode, setGraphMode] = useState<'tree' | 'network'>('tree')

  // Load graphMode from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('workspace-graph-mode') as 'tree' | 'network'
      if (saved === 'tree' || saved === 'network') {
        setGraphMode(saved)
      }
    }
  }, [])

  const handleSetGraphMode = (mode: 'tree' | 'network') => {
    setGraphMode(mode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('workspace-graph-mode', mode)
    }
  }

  // State cho việc mở Modal kết nối
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)

  // State và useEffect kiểm tra gợi ý kết nối Google Drive thông minh
  const [showGDrivePrompt, setShowGDrivePrompt] = useState(false)
  const [promptState, setPromptState] = useState<'prompt' | 'warning'>('prompt')

  useEffect(() => {
    async function checkGDriveSync() {
      if (typeof window === 'undefined') return
      const dismissed = localStorage.getItem('mindlabs-gdrive-dismissed')
      if (dismissed === 'true') return

      try {
        const res = await fetch('/api/gdrive/token')
        if (res.status === 404) {
          setShowGDrivePrompt(true)
        }
      } catch (err) {
        console.error('Failed to check GDrive sync status:', err)
      }
    }
    
    const timer = setTimeout(() => {
      checkGDriveSync()
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // State quản lý các node đang mở ở Sidebar
  const [openNodes, setOpenNodes] = useState<Set<string>>(new Set())
  const [isOpenNodesLoaded, setIsOpenNodesLoaded] = useState(false)
  // Sync Context with Next.js searchParams (for external links / router.push from other pages)
  useEffect(() => {
    const noteParam = searchParams?.get('note')
    const canvasParam = searchParams?.get('canvas')
    const linkParam = searchParams?.get('link')
    const viewParam = searchParams?.get('view')

    if (noteParam && noteParam !== selection.noteId) {
      selectNote(noteParam)
    } else if (canvasParam && canvasParam !== selection.canvasId) {
      selectCanvas(canvasParam)
    } else if (linkParam && linkParam !== selection.linkId) {
      selectLink(linkParam)
    } else if (viewParam === 'graph' && !selection.graphView) {
      selectGraphView()
    } else if (!noteParam && !canvasParam && !linkParam && viewParam !== 'graph' && (selection.noteId || selection.canvasId || selection.linkId || selection.graphView)) {
      clearSelection()
    }
  }, [searchParams, selection, selectNote, selectCanvas, selectLink, selectGraphView, clearSelection])


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
    selectNote(noteId)
    window.history.replaceState(null, '', `/workspace?note=${noteId}`)
  }

  const handleSelectCanvas = (mapId: string) => {
    selectCanvas(mapId)
    window.history.replaceState(null, '', `/workspace?canvas=${mapId}`)
  }

  const handleSelectLink = (linkId: string) => {
    selectLink(linkId)
    window.history.replaceState(null, '', `/workspace?link=${linkId}`)
  }

  return (
    <>
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
          <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
            {/* Control Switcher Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border-main shrink-0 bg-surface/30 backdrop-blur-md">
              <h2 className="text-sm font-semibold text-foreground">Tổng quan Library</h2>
              <div className="flex items-center gap-1 p-0.5 bg-hover-bg rounded-lg border border-border-main/50">
                <button
                  onClick={() => handleSetGraphMode('tree')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    graphMode === 'tree'
                      ? 'bg-surface text-foreground shadow-subtle border border-border-main/50'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Sơ đồ cây thư mục</span>
                </button>
                <button
                  onClick={() => handleSetGraphMode('network')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    graphMode === 'network'
                      ? 'bg-surface text-foreground shadow-subtle border border-border-main/50'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Mạng liên kết (Graph)</span>
                </button>
              </div>
            </div>
            
            {/* View Render */}
            <div className="flex-1 min-h-0 relative">
              {graphMode === 'tree' ? (
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
              ) : (
                <GraphView nodes={nodes} />
              )}
            </div>
          </div>
        ) : (
          /* Trang chủ Workspace: Priority tasks + Drive-style library */
          <WorkspaceHome
            nodes={globalTreeNodes}
            onSelectNote={handleSelectNote}
            onSelectCanvas={handleSelectCanvas}
            onSelectLink={handleSelectLink}
          />
        )}

      {/* Connect Modal */}
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

      {/* Google Drive Connect Prompt Modal (Cảnh báo 2 lớp) */}
      {showGDrivePrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative bg-surface border border-border-main rounded-2xl p-6 w-full max-w-[420px] shadow-overlay z-10 animate-in fade-in zoom-in-95 duration-200">
            {promptState === 'prompt' ? (
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-5 border border-primary/20">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>

                <h3 className="text-base font-black tracking-tighter text-foreground mb-2">
                  Đồng bộ tài liệu của bạn
                </h3>
                
                <p className="text-xs text-secondary/60 leading-relaxed mb-6">
                  Tài liệu hiện tại chỉ lưu trữ trên thiết bị này. Hãy kết nối Google Drive để tự động đồng bộ hóa và sao lưu dữ liệu, giúp bạn truy cập trên mọi thiết bị khác chỉ cần đăng nhập.
                </p>

                <div className="flex flex-col gap-2 w-full">
                  <a
                    href="/api/gdrive/connect"
                    className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-foreground hover:bg-foreground/90 active:scale-[0.98] transition-all cursor-pointer select-none"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Kết nối Google Drive</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setPromptState('warning')}
                    className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-foreground hover:bg-hover-bg border border-border-main active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Để sau
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center animate-in fade-in duration-200">
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-5 border border-amber-500/20">
                  <ShieldAlert className="w-7 h-7" strokeWidth={2} />
                </div>

                <h3 className="text-base font-black tracking-tighter text-amber-600 dark:text-amber-500 mb-2">
                  Xác nhận lưu trữ cục bộ
                </h3>
                
                <p className="text-xs text-secondary/60 leading-relaxed mb-6">
                  Cảnh báo: Dữ liệu của bạn sẽ <strong className="text-foreground">chỉ được lưu trữ trên trình duyệt này</strong> và sẽ <strong className="text-red-500 font-bold">không được sao lưu lên đám mây</strong>. Nếu trình duyệt bị xóa dữ liệu, bạn sẽ bị mất toàn bộ tài liệu.
                </p>

                <div className="flex flex-col gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('mindlabs-gdrive-dismissed', 'true')
                      setShowGDrivePrompt(false)
                    }}
                    className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Tôi đã hiểu, lưu cục bộ
                  </button>

                  <button
                    type="button"
                    onClick={() => setPromptState('prompt')}
                    className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-foreground hover:bg-hover-bg border border-border-main active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Quay lại kết nối
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
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
    <div className="flex-1 flex flex-col h-full bg-background">
      <div className="flex-1 relative flex flex-col h-full min-h-0">
        {!formattedUrl ? (
          <div className="flex-1 m-4 p-6 bg-surface border border-border-main rounded-2xl flex flex-col items-center justify-center text-center">
            <LucideLink className="w-10 h-10 text-secondary/30 mb-2 animate-bounce" />
            <h3 className="text-sm font-bold text-foreground mb-1">Chưa có liên kết URL</h3>
            <p className="text-xs text-secondary/50 max-w-sm mb-4">Nhấp chuột phải vào tên liên kết này ở thanh bên, chọn "Sửa tiêu đề & URL Link" để thêm địa chỉ web của bạn.</p>
          </div>
        ) : isChecking ? (
          <div className="flex-1 m-4 p-6 bg-surface border border-border-main rounded-2xl flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <h3 className="text-sm font-bold text-foreground mb-1">Đang kiểm tra bảo mật trang web...</h3>
            <p className="text-xs text-secondary/40 max-w-xs">Xác minh khả năng hiển thị trực tiếp để mang lại trải nghiệm tối ưu.</p>
          </div>
        ) : (isEmbeddable || forceEmbed) ? (
          <div className="flex-1 bg-surface overflow-hidden flex flex-col relative h-full w-full">
            <div className="absolute top-3 right-3 z-50 flex items-center gap-1.5">
              <button
                onClick={handleRefresh}
                className="p-2 bg-surface/80 backdrop-blur-md hover:bg-surface text-secondary/70 hover:text-foreground border border-border-main rounded-xl transition-all duration-150 cursor-pointer"
                title="Tải lại trang"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
                </svg>
              </button>
              <button
                onClick={handleOpenNewTab}
                className="flex items-center gap-0 hover:gap-1.5 px-2 py-2 hover:px-3 bg-surface/80 backdrop-blur-md hover:bg-surface text-secondary/70 hover:text-primary border border-border-main rounded-xl transition-all duration-300 ease-in-out cursor-pointer group"
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
              className="flex-1 w-full h-full border-none bg-surface"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              title={node.title}
            />
          </div>
        ) : (
          <div className="flex-1 m-4 bg-surface border border-border-main rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-surface to-active-bg/30">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-5 border border-amber-500/20 animate-pulse">
              <ShieldAlert className="w-8 h-8 text-amber-500" strokeWidth={1.8} />
            </div>
            
            <h3 className="text-base font-extrabold text-foreground mb-2">Không thể xem trực tiếp trang web</h3>
            
            <p className="text-xs text-secondary/60 max-w-md leading-relaxed mb-6">
              Để bảo vệ quyền riêng tư và thông tin của bạn, trang web <strong className="text-foreground font-bold">{hostName}</strong> từ chối hiển thị nội dung của họ bên trong các ứng dụng khác (qua chính sách bảo mật X-Frame-Options/CSP).
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
                className="w-full sm:w-auto px-4 py-3 text-xs font-semibold text-foreground hover:bg-hover-bg rounded-xl transition-all duration-150 border border-border-main cursor-pointer"
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
