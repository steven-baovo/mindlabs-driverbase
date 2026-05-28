import React from 'react'

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

export default function Logo({ size = 28, className, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="31.5 18.5 37.5 63.5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-zinc-900 dark:text-white transition-transform duration-300 ${className}`}
      {...props}
    >
      {/* Sleek Minimalist 'L' Lettermark with Round Dot */}
      <path
        d="M31.5 18.5H46.5V63.5C46.5 67.5 49.5 70.5 53.5 70.5H68.5V82H51C40 82 31.5 73 31.5 62V18.5Z"
        fill="currentColor"
      />
      <circle
        cx="62.5"
        cy="58"
        r="6.5"
        fill="currentColor"
      />
    </svg>
  )
}
