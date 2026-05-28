'use client'

import React, { useState, CSSProperties } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  getStraightPath,
  getSmoothStepPath,
  useReactFlow,
  useStore,
  MarkerType
} from '@xyflow/react'
import { Trash2, Palette, ArrowRight, ArrowLeftRight, Minus, Edit2, Check, Activity } from 'lucide-react'

export default function MindmapEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  markerStart,
  selected,
  data,
}: EdgeProps) {
  const edgeData = data as { label?: string; pathType?: string; direction?: string } | undefined
  const edgeStyle = style as CSSProperties | undefined

  const { setEdges } = useReactFlow()
  const [activeMenu, setActiveMenu] = useState<'color' | 'direction' | 'path' | 'edit' | null>(null)
  const zoom = useStore((s) => s.transform[2])
  
  const pathParams = {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  }

  let edgePath = ''
  let labelX = 0
  let labelY = 0

  if (edgeData?.pathType === 'straight') {
    [edgePath, labelX, labelY] = getStraightPath(pathParams)
  } else if (edgeData?.pathType === 'smoothstep') {
    [edgePath, labelX, labelY] = getSmoothStepPath({ ...pathParams, borderRadius: 16 })
  } else {
    [edgePath, labelX, labelY] = getBezierPath(pathParams)
  }

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation()
  }

  const deleteEdge = () => {
    setEdges((es) => es.filter((e) => e.id !== id))
  }

  const updateDirection = (dir: 'none' | 'one' | 'both') => {
    setEdges((es) =>
      es.map((e) => {
        if (e.id === id) {
          const newData = { ...e.data, direction: dir }
          return {
            ...e,
            data: newData,
            markerEnd: dir !== 'none' ? { type: MarkerType.ArrowClosed, color: e.style?.stroke || '#94A3B8' } : undefined,
            markerStart: dir === 'both' ? { type: MarkerType.ArrowClosed, color: e.style?.stroke || '#94A3B8' } : undefined,
          }
        }
        return e
      })
    )
  }

  const updateColor = (color: string) => {
    setEdges((es) =>
      es.map((e) => {
        if (e.id === id) {
          const newStyle = { ...e.style, stroke: color }
          return {
            ...e,
            style: newStyle,
            markerEnd: e.markerEnd ? { ...(e.markerEnd as any), color } : undefined,
            markerStart: e.markerStart ? { ...(e.markerStart as any), color } : undefined,
          }
        }
        return e
      })
    )
    setActiveMenu(null)
  }


  const updateLabel = (newLabel: string) => {
    setEdges((es) =>
      es.map((e) => {
        if (e.id === id) {
          return { ...e, data: { ...(e.data as any), label: newLabel } }
        }
        return e
      })
    )
  }

  const colors = [
    { name: 'Gray', value: '#94A3B8' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Purple', value: '#a855f7' },
  ]

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} markerStart={markerStart} style={edgeStyle} />
      
      {/* Hiển thị label (Ghi chú) trên đường dẫn */}
      {edgeData?.label && activeMenu !== 'edit' && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 1001,
            }}
            className="nodrag nopan bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 font-medium whitespace-nowrap cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shadow-subtle"
            onClick={() => setActiveMenu('edit')}
          >
            {edgeData.label}
          </div>
        </EdgeLabelRenderer>
      )}

      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY - 36 - (edgeData?.label ? 24 : 0)}px) scale(${1 / zoom})`,
              pointerEvents: 'all',
              zIndex: 1001,
            }}
            className="nodrag nopan relative"
          >
            {activeMenu === 'edit' ? (
              <div className="flex items-center gap-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-md p-1 shadow-subtle animate-in fade-in zoom-in duration-150">
                <input
                  autoFocus
                  type="text"
                  defaultValue={(edgeData?.label as string) || ''}
                  onBlur={(e) => {
                    updateLabel(e.target.value)
                    setActiveMenu(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateLabel(e.currentTarget.value)
                      setActiveMenu(null)
                    }
                  }}
                  className="px-2 py-1 text-xs bg-transparent outline-none border-none text-zinc-800 dark:text-zinc-200 w-32 placeholder-zinc-400"
                  placeholder="Note..."
                />
              </div>
            ) : (
              <div className="flex items-center gap-0.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-md p-1 shadow-subtle animate-in fade-in zoom-in duration-200">
                <button
                  onClick={deleteEdge}
                  className="w-7 h-7 rounded-sm flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150 active:scale-95"
                  title="Delete Connection"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                
                <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

                <div className="relative">
                  <button
                    onClick={() => setActiveMenu(activeMenu === 'color' ? null : 'color')}
                    className={`w-7 h-7 rounded-sm flex items-center justify-center transition-all duration-150 active:scale-95 ${
                      activeMenu === 'color' 
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' 
                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                    title="Change Color"
                  >
                    <Palette className="w-3.5 h-3.5" />
                  </button>
                  {activeMenu === 'color' && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-md p-1.5 flex gap-1.5 z-50 animate-in fade-in zoom-in duration-150">
                      {colors.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => updateColor(c.value)}
                          className="w-5 h-5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:scale-110 transition-transform flex items-center justify-center"
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        >
                          {edgeStyle?.stroke === c.value && <Check className="w-3 h-3 text-white mix-blend-difference" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setActiveMenu(activeMenu === 'direction' ? null : 'direction')}
                    className={`w-7 h-7 rounded-sm flex items-center justify-center transition-all duration-150 active:scale-95 ${
                      activeMenu === 'direction' 
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' 
                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                    title="Change Direction"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  {activeMenu === 'direction' && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-md p-1 flex gap-0.5 z-50 shadow-floating animate-in fade-in zoom-in duration-150">
                      <button
                        onClick={() => updateDirection('none')}
                        className="w-7 h-7 rounded-sm flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-150 active:scale-95"
                        title="Nondirectional"
                      >
                        <Minus className="w-4 h-4" strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => updateDirection('one')}
                        className="w-7 h-7 rounded-sm flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-150 active:scale-95"
                        title="Unidirectional"
                      >
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => updateDirection('both')}
                        className="w-7 h-7 rounded-sm flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-150 active:scale-95"
                        title="Bidirectional"
                      >
                        <ArrowLeftRight className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setActiveMenu('edit')}
                  className="w-7 h-7 rounded-sm flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-150 active:scale-95"
                  title="Add Note"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
