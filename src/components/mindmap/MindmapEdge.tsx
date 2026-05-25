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
            className="nodrag nopan bg-white px-2 py-0.5 rounded border border-gray-200 text-xs text-gray-700 whitespace-nowrap"
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
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY - (edgeData?.label ? 30 : 0)}px) scale(${1 / zoom})`,
              pointerEvents: 'all',
              zIndex: 1001,
            }}
            className="nodrag nopan relative"
          >
            {activeMenu === 'edit' ? (
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
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
                  className="px-2 py-1 text-sm outline-none w-32"
                  placeholder="Note..."
                />
              </div>
            ) : (
              <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg p-0.5 animate-in fade-in zoom-in duration-200">
                <button
                  onClick={deleteEdge}
                  className="p-1 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-md transition-colors"
                  title="Delete Connection"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                
                <div className="w-px h-4 bg-gray-200 mx-0.5" />

                <div className="relative">
                  <button
                    onClick={() => setActiveMenu(activeMenu === 'color' ? null : 'color')}
                    className={`p-1 rounded-md transition-colors ${activeMenu === 'color' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Change Color"
                  >
                    <Palette className="w-3.5 h-3.5" />
                  </button>
                  {activeMenu === 'color' && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-lg p-2 flex gap-1.5 z-50 animate-in fade-in zoom-in duration-150">
                      {colors.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => updateColor(c.value)}
                          className={`w-5 h-5 rounded-full border border-gray-200 hover:scale-110 transition-transform flex items-center justify-center`}
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
                    className={`p-1 rounded-md transition-colors ${activeMenu === 'direction' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Change Direction"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  {activeMenu === 'direction' && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-lg p-1 flex gap-0.5 z-50 animate-in fade-in zoom-in duration-150">
                      <button onClick={() => updateDirection('none')} className="p-2 hover:bg-gray-100 rounded-md transition-colors" title="Nondirectional">
                        <Minus className="w-4 h-4" strokeWidth={3} />
                      </button>
                      <button onClick={() => updateDirection('one')} className="p-2 hover:bg-gray-100 rounded-md transition-colors" title="Unidirectional">
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                      <button onClick={() => updateDirection('both')} className="p-2 hover:bg-gray-100 rounded-md transition-colors" title="Bidirectional">
                        <ArrowLeftRight className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  )}
                </div>



                <button
                  onClick={() => setActiveMenu('edit')}
                  className="p-1 rounded-md transition-colors text-gray-500 hover:bg-gray-100"
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
