'use client'

import React, { useMemo, useState, useEffect, useRef } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { WorkspaceNode } from '@/lib/node-utils'

const STANDARD_FONT_SIZE = 13

const COLORS = {
  light: {
    normal: { r: 55, g: 65, b: 81 },      // #374151
    active: { r: 79, g: 70, b: 229 },     // #4F46E5
    faded: { r: 229, g: 231, b: 235 }     // #E5E7EB
  },
  dark: {
    normal: { r: 228, g: 228, b: 231 },   // #e4e4e7
    active: { r: 129, g: 140, b: 248 },   // #818cf8
    faded: { r: 31, g: 31, b: 35 }        // #1f1f23
  }
}

const interpolateColor = (
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number },
  factor: number
) => {
  const r = Math.round(color1.r + (color2.r - color1.r) * factor)
  const g = Math.round(color1.g + (color2.g - color1.g) * factor)
  const b = Math.round(color1.b + (color2.b - color1.b) * factor)
  return `rgb(${r}, ${g}, ${b})`
}

interface GraphViewProps {
  nodes: WorkspaceNode[]
}

export default function GraphView({ nodes }: GraphViewProps) {
  const [hoveredNode, setHoveredNode] = useState<any>(null)
  const [hoverProgress, setHoverProgress] = useState(0)
  const hoverProgressRef = useRef(0) // Ref để tránh stale closure trong animation
  const [isDark, setIsDark] = useState(false)
  const graphRef = useRef<any>(null)

  // Hoạt ảnh chuyển đổi mượt mà khi hover thay đổi
  useEffect(() => {
    let animationFrameId: number
    const duration = 250 // Hoạt ảnh diễn ra trong 250ms
    const target = hoveredNode ? 1 : 0
    
    const startTime = performance.now()
    const startValue = hoverProgressRef.current // Đọc từ ref để tránh stale closure
    
    const animate = (time: number) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing: easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3)
      const nextValue = startValue + (target - startValue) * ease
      
      hoverProgressRef.current = nextValue // Cập nhật ref trước khi set state
      setHoverProgress(nextValue)
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }
    
    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [hoveredNode])

  // Theo dõi đổi theme tự động
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  // 1. Xử lý dữ liệu đồ thị (Chỉ giữ lại Note, Canvas/Map, và Link)
  const { graphData } = useMemo(() => {
    const filteredNodes = nodes.filter(n => n.type === 'note' || n.type === 'map' || n.type === 'link')

    const gNodes = filteredNodes.map(n => ({
      id: n.id,
      name: n.title,
      type: n.type,
      connected_node_ids: n.connected_node_ids || []
    }))

    // Tạo danh sách Links cho đồ thị (Tránh lặp lại kết nối hai chiều)
    const gLinks: { source: string; target: string; type: 'hierarchy' | 'custom' }[] = []
    const processedPairs = new Set<string>()
    const filteredNodeIds = new Set(gNodes.map(n => n.id))

    filteredNodes.forEach(n => {
      if (n.connected_node_ids && Array.isArray(n.connected_node_ids)) {
        n.connected_node_ids.forEach(targetId => {
          // Chỉ thêm link nếu cả source và target đều tồn tại trong filtered nodes
          if (!filteredNodeIds.has(targetId)) return
          const pairKey = [n.id, targetId].sort().join('-')
          if (!processedPairs.has(pairKey)) {
            processedPairs.add(pairKey)
            gLinks.push({
              source: n.id,
              target: targetId,
              type: 'custom'
            })
          }
        })
      }
    })

    return { 
      graphData: { nodes: gNodes, links: gLinks }
    }
  }, [nodes])

  // Tự động căn giữa và fit toàn bộ các node vào giữa khung hình khi dữ liệu thay đổi
  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      const timer = setTimeout(() => {
        graphRef.current.zoomToFit(300, 80) // 300ms animation, 80px padding để không sát viền
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [graphData])

  return (
    <div className="w-full h-full bg-background relative">
      {graphData.nodes.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-secondary/50 text-xs">
          Không có dữ liệu node để hiển thị. Hãy tạo note hoặc canvas trước!
        </div>
      ) : (
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeLabel="name"
          backgroundColor={isDark ? '#08080a' : '#ffffff'}
          
          // Tự vẽ Node và Chữ (Vẽ Canvas)
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.name;
            
            const palette = isDark ? COLORS.dark : COLORS.light;
            let targetColor = palette.normal;
            
            if (hoveredNode) {
              const isConnected = node.id === hoveredNode.id || 
                                  (hoveredNode.connected_node_ids && hoveredNode.connected_node_ids.includes(node.id)) ||
                                  (node.connected_node_ids && node.connected_node_ids.includes(hoveredNode.id));
              
              targetColor = isConnected ? palette.active : palette.faded;
            }
            
            const color = interpolateColor(palette.normal, targetColor, hoverProgress);
            
            // Vẽ hình tròn (Kích thước to gấp đôi, bán kính r=3)
            const radius = 3; 
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();
            
            // Vẽ tên nốt ở dưới (Chỉ hiện khi zoom đủ lớn để không bị rối)
            if (globalScale > 0.6) {
              ctx.save();
              const m = ctx.getTransform?.();
              
              // Tính font size động theo tỉ lệ zoom để không bị quá to so với node
              const screenFontSize = 8 + 4 * globalScale;
              
              if (m) {
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.font = `${screenFontSize}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = color;
                ctx.fillText(label, node.x * m.a + m.e, node.y * m.d + m.f + (radius + 1.5) * globalScale);
              } else {
                ctx.font = `${screenFontSize / globalScale}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = color;
                ctx.fillText(label, node.x, node.y + radius + 1.5);
              }
              ctx.restore();
            }
          }}
          
          linkColor={link => {
            const l = link as any
            const defaultColorStr = isDark ? '#1f1f23' : '#E5E7EB';
            
            if (hoverProgress < 0.001) return defaultColorStr;
            
            const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
            const targetId = typeof l.target === 'object' ? l.target.id : l.target;
            
            const palette = isDark ? COLORS.dark : COLORS.light;
            const normalRGB = isDark ? { r: 31, g: 31, b: 35 } : { r: 229, g: 231, b: 235 };
            
            let targetRGB = normalRGB;
            if (hoveredNode) {
              if (sourceId === hoveredNode.id || targetId === hoveredNode.id) {
                targetRGB = palette.active; // Active Indigo
              } else {
                targetRGB = isDark ? { r: 24, g: 24, b: 27 } : { r: 243, g: 244, b: 246 }; // Muted background color
              }
            }
            
            return interpolateColor(normalRGB, targetRGB, hoverProgress);
          }}
          
          onNodeHover={node => setHoveredNode(node)}
          d3VelocityDecay={0.4}
        />
      )}
    </div>
  )
}
