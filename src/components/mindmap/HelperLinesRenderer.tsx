import React from 'react'
import { useStore } from '@xyflow/react'
import { HelperLines } from './helperLines'

export const HelperLinesRenderer: React.FC<HelperLines> = ({ vertical, horizontal }) => {
  const transform = useStore((store) => store.transform)

  return (
    <svg
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
        top: 0,
        left: 0,
      }}
    >
      <g transform={`translate(${transform[0]} ${transform[1]}) scale(${transform[2]})`}>
        {vertical && (
          <line
            x1={vertical.x}
            y1={vertical.y1}
            x2={vertical.x}
            y2={vertical.y2}
            stroke="#3b82f6"
            strokeWidth="1"
          />
        )}
        {horizontal && (
          <line
            x1={horizontal.x1}
            y1={horizontal.y}
            x2={horizontal.x2}
            y2={horizontal.y}
            stroke="#3b82f6"
            strokeWidth="1"
          />
        )}
      </g>
    </svg>
  )
}
