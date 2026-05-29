import React from 'react'

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

export default function Logo({ size = 28, className, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-zinc-900 dark:text-white transition-transform duration-300 ${className}`}
      {...props}
    >
      <g transform="skewX(-7)">
        <rect
          x="26"
          y="5"
          width="30"
          height="90"
          rx="9"
          fill="currentColor"
        />
        <rect
          x="63"
          y="56"
          width="30"
          height="39"
          rx="9"
          fill="currentColor"
        />
      </g>
    </svg>
  )
}
