import { Node } from '@xyflow/react'

export type HelperLines = {
  vertical?: { x: number; y1: number; y2: number };
  horizontal?: { y: number; x1: number; x2: number };
}

export function getHelperLines(
  node: Node,
  allNodes: Node[],
  distance = 15,
  gridSize = 24
): {
  snappedPosition: { x: number; y: number }
  helperLines: HelperLines
} {
  const helperLines: HelperLines = {}
  
  // Default to manual grid snap if no helper lines are found
  const snappedPosition = { 
    x: Math.round(node.position.x / gridSize) * gridSize, 
    y: Math.round(node.position.y / gridSize) * gridSize 
  }

  const nodeWidth = node.measured?.width ?? 0
  const nodeHeight = node.measured?.height ?? 0

  const nodeBounds = {
    left: node.position.x,
    right: node.position.x + nodeWidth,
    top: node.position.y,
    bottom: node.position.y + nodeHeight,
    hCenter: node.position.x + nodeWidth / 2,
    vCenter: node.position.y + nodeHeight / 2,
  }

  let minV = Infinity
  let minH = Infinity

  allNodes.forEach((otherNode) => {
    if (otherNode.id === node.id) return

    const otherWidth = otherNode.measured?.width ?? 0
    const otherHeight = otherNode.measured?.height ?? 0

    const otherBounds = {
      left: otherNode.position.x,
      right: otherNode.position.x + otherWidth,
      top: otherNode.position.y,
      bottom: otherNode.position.y + otherHeight,
      hCenter: otherNode.position.x + otherWidth / 2,
      vCenter: otherNode.position.y + otherHeight / 2,
    }

    const y1 = Math.min(nodeBounds.top, otherBounds.top)
    const y2 = Math.max(nodeBounds.bottom, otherBounds.bottom)
    const x1 = Math.min(nodeBounds.left, otherBounds.left)
    const x2 = Math.max(nodeBounds.right, otherBounds.right)

    // Vertical alignment (x-axis)
    const vDiffs = [
      { diff: Math.abs(nodeBounds.left - otherBounds.left), snapX: otherBounds.left, x: otherBounds.left },
      { diff: Math.abs(nodeBounds.right - otherBounds.right), snapX: otherBounds.right - nodeWidth, x: otherBounds.right },
      { diff: Math.abs(nodeBounds.hCenter - otherBounds.hCenter), snapX: otherBounds.hCenter - nodeWidth / 2, x: otherBounds.hCenter },
    ]

    vDiffs.forEach(({ diff, snapX, x }) => {
      if (diff < distance && diff < minV) {
        minV = diff
        snappedPosition.x = snapX
        helperLines.vertical = { x, y1, y2 }
      }
    })

    // Horizontal alignment (y-axis)
    const hDiffs = [
      { diff: Math.abs(nodeBounds.top - otherBounds.top), snapY: otherBounds.top, y: otherBounds.top },
      { diff: Math.abs(nodeBounds.bottom - otherBounds.bottom), snapY: otherBounds.bottom - nodeHeight, y: otherBounds.bottom },
      { diff: Math.abs(nodeBounds.vCenter - otherBounds.vCenter), snapY: otherBounds.vCenter - nodeHeight / 2, y: otherBounds.vCenter },
    ]

    hDiffs.forEach(({ diff, snapY, y }) => {
      if (diff < distance && diff < minH) {
        minH = diff
        snappedPosition.y = snapY
        helperLines.horizontal = { y, x1, x2 }
      }
    })
  })

  return { snappedPosition, helperLines }
}
