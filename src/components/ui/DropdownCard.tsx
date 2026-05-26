'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

// --- Cấu hình Quy chuẩn Dãn cách & Phong cách chung ---
export const DROPDOWN_STYLES = {
  // Khung chứa: Bo góc chuẩn 8px (rounded-md), đệm dọc 6px (py-1.5), bóng đổ mịn
  card: "bg-surface border border-border-main rounded-md py-1.5 shadow-overlay animate-in fade-in zoom-in-95 duration-150 z-[100]",
  
  // Tiêu đề: Đệm dọc 6px, ngang 12px, gạch chân phân chia mảnh
  header: "px-3 py-1.5 border-b border-border-main mb-1 shrink-0",
  
  // Vách ngăn mảnh 1px
  separator: "border-t border-border-main my-1 shrink-0",
  
  // Mục chọn tương tác: Đệm dọc 6px, ngang 12px, khoảng cách icon-chữ 10px (gap-2.5), cỡ chữ 12px
  itemBase: "w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-left cursor-pointer transition-colors transition-all active:scale-[0.98]",
  itemDefault: "text-foreground/80 hover:bg-hover-bg hover:text-foreground",
  itemDanger: "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
}

// --- 1. Khung chứa chính DropdownCard (Bo góc chuẩn 8px) ---
interface DropdownCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  dropdownRef?: React.RefObject<HTMLDivElement | null>;
}

export const DropdownCard = React.forwardRef<HTMLDivElement, DropdownCardProps>(
  ({ children, className = '', dropdownRef, ...props }, ref) => {
    return (
      <div
        ref={(node) => {
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as any).current = node
          if (dropdownRef) (dropdownRef as any).current = node
        }}
        className={`${DROPDOWN_STYLES.card} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownCard.displayName = 'DropdownCard'

// --- 2. Tiêu đề DropdownHeader ---
interface DropdownHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
}

export const DropdownHeader: React.FC<DropdownHeaderProps> = ({ title, subtitle, className = '', ...props }) => {
  return (
    <div className={`${DROPDOWN_STYLES.header} ${className}`} {...props}>
      <p className="text-xs text-foreground font-bold truncate">{title}</p>
      {subtitle && (
        <p className="text-[10px] text-foreground/50 truncate mt-0.5">{subtitle}</p>
      )}
    </div>
  )
}
DropdownHeader.displayName = 'DropdownHeader'

// --- 3. Đường vách ngăn DropdownSeparator ---
export const DropdownSeparator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => {
  return <div className={`${DROPDOWN_STYLES.separator} ${className}`} {...props} />
}
DropdownSeparator.displayName = 'DropdownSeparator'

// --- 4. Mục chọn DropdownItem ---
interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: 'default' | 'danger';
  href?: string;
}

export const DropdownItem = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, DropdownItemProps>(
  ({ children, icon: Icon, variant = 'default', className = '', href, onClick, ...props }, ref) => {
    const variantClass = variant === 'danger' ? DROPDOWN_STYLES.itemDanger : DROPDOWN_STYLES.itemDefault
    
    const content = (
      <>
        {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${variant === 'danger' ? 'text-red-500' : 'text-foreground/50'}`} />}
        <span className="truncate">{children}</span>
      </>
    )

    if (href) {
      return (
        <a
          href={href}
          ref={ref as any}
          className={`${DROPDOWN_STYLES.itemBase} ${variantClass} ${className}`}
          onClick={onClick as any}
          {...(props as any)}
        >
          {content}
        </a>
      )
    }

    return (
      <button
        type="button"
        ref={ref as any}
        onClick={onClick}
        className={`${DROPDOWN_STYLES.itemBase} ${variantClass} ${className}`}
        {...props}
      >
        {content}
      </button>
    )
  }
)
DropdownItem.displayName = 'DropdownItem'
