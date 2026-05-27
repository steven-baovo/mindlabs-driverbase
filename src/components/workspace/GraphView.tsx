'use client'

import React, { useMemo, useState, useEffect } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { WorkspaceNode } from '@/lib/node-utils'

interface GraphViewProps {
  nodes: WorkspaceNode[]
}

export default function GraphView({ nodes }: GraphViewProps) {
  const [hoveredNode, setHoveredNode] = useState<any>(null)
  const [isDark, setIsDark] = useState(false)

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

    nodes.forEach(n => {
      if (n.connected_node_ids && Array.isArray(n.connected_node_ids)) {
        n.connected_node_ids.forEach(targetId => {
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

  return (
    <div className="w-full h-full bg-background relative">
      {nodes.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-secondary/50 text-xs">
          Không có dữ liệu node để hiển thị. Hãy tạo node trước!
        </div>
      ) : (
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="name"
          backgroundColor={isDark ? '#08080a' : '#ffffff'}
          
          // Tự vẽ Node và Chữ (Vẽ Canvas)
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.name;
            // Tính kích thước font chữ (Obsidian chữ khá nhỏ và mảnh)
            const fontSize = 11 / globalScale; 
            ctx.font = `${fontSize}px Inter, sans-serif`;
            
            // Xác định màu sắc (Mặc định xám đậm ở light và zinc sáng ở dark)
            let color = isDark ? '#e4e4e7' : '#374151'; // Gray 200 vs Gray 700
            const activeIndigo = isDark ? '#818cf8' : '#4F46E5'; // Indigo 400 vs Indigo 600
            
            if (hoveredNode) {
              const isConnected = node.id === hoveredNode.id || 
                                  (hoveredNode.connected_node_ids && hoveredNode.connected_node_ids.includes(node.id)) ||
                                  (node.connected_node_ids && node.connected_node_ids.includes(hoveredNode.id));
              
              if (isConnected) {
                color = activeIndigo; // Sáng lên màu Indigo tương ứng
              } else {
                color = isDark ? '#1f1f23' : '#E5E7EB'; // Mờ đi (Zinc 900 vs Gray 200)
              }
            }
            
            // Vẽ hình tròn (Kích thước to gấp đôi, bán kính r=3)
            const radius = 3; 
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();
            
            // Vẽ tên nốt ở dưới (Chỉ hiện khi zoom đủ lớn để không bị rối)
            if (globalScale > 0.6) {
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';
              ctx.fillStyle = color;
              ctx.fillText(label, node.x, node.y + radius + 1.5);
            }
          }}
          
          linkColor={link => {
            const l = link as any
            const defaultLinkColor = isDark ? '#1f1f23' : '#E5E7EB';
            const activeIndigo = isDark ? '#818cf8' : '#4F46E5';
            
            if (!hoveredNode) return defaultLinkColor;
            
            const sourceId = typeof l.source === 'object' ? l.source.id : l.source
            const targetId = typeof l.target === 'object' ? l.target.id : l.target
            
            if (sourceId === hoveredNode.id || targetId === hoveredNode.id) {
              return activeIndigo; // Highlight Indigo cho liên kết trực tiếp khi hover
            }
            
            return isDark ? '#18181b' : '#F3F4F6';
          }}
          
          onNodeHover={node => setHoveredNode(node)}
          d3VelocityDecay={0.4}
        />
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-sm p-3 rounded-xl border border-border-main text-xs flex flex-col gap-1.5 shadow-overlay">
        <div className="font-bold text-foreground mb-0.5">Chú thích</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#374151] dark:bg-[#e4e4e7] rounded-full"></div>
          <span className="text-secondary">Node (Mặc định)</span>
        </div>
        <div className="text-secondary/50 text-[10px] mt-0.5">* Phóng to để nhìn thấy tên Node.</div>
      </div>
    </div>
  )
}
