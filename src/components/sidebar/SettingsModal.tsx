'use client'

import { useState } from 'react'
import { User as UserIcon, Paintbrush, X, ChevronDown, ShieldCheck, Database } from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  theme: Theme
  onThemeChange: (theme: Theme) => void
  fontSize: string
  onFontSizeChange: (size: string) => void
  user: any
}

interface CustomSelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  options: CustomSelectOption[]
  value: string
  onChange: (value: any) => void
}

function CustomSelect({ options, value, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const activeOption = options.find(o => o.value === value) || options[0]

  return (
    <div className="relative inline-block text-left select-none shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-3 py-1.5 min-w-[130px] bg-surface border border-border-main rounded-md text-[13px] font-normal text-foreground hover:bg-hover-bg transition-all active:scale-[0.98] cursor-pointer focus:outline-none"
      >
        <span className="truncate">{activeOption.label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-foreground/75 dark:text-zinc-400 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1 w-full min-w-[130px] bg-surface border border-border-main rounded-md py-1 shadow-overlay z-50 animate-in fade-in zoom-in-95 duration-100">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-1.5 text-[13px] transition-colors cursor-pointer block focus:outline-none ${
                  option.value === value
                    ? 'bg-primary/5 text-primary font-medium'
                    : 'text-foreground/80 hover:bg-hover-bg hover:text-foreground'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  fontSize,
  onFontSizeChange,
  user,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'account' | 'appearance'>('account')

  if (!isOpen) return null

  const displayName = user?.name || user?.email?.split('@')[0] || 'Workspace'
  const email = user?.email || 'local@leanity.app'

  // Get stable colors for avatar matching SidebarHeader
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-pink-500 text-white',
      'bg-purple-500 text-white',
      'bg-indigo-500 text-white',
      'bg-blue-500 text-white',
      'bg-emerald-500 text-white',
      'bg-amber-500 text-white',
      'bg-rose-500 text-white',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  const getInitials = (name: string) => {
    if (!name) return 'WS'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const initials = getInitials(displayName)
  const avatarBg = getAvatarColor(displayName)

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ]

  const fontSizeOptions = [
    { value: '12px', label: '12px' },
    { value: '13px', label: 'Default' },
    { value: '14px', label: '14px' },
    { value: '15px', label: '15px' },
    { value: '16px', label: '16px' },
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[100] flex items-center justify-center animate-in fade-in duration-200 p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Settings Modal Container */}
      <div className="relative bg-surface border border-border-main rounded-md w-full max-w-[1020px] h-[660px] max-h-[95vh] shadow-overlay z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Sidebar Menu (Width: 260px) */}
        <div className="w-full md:w-[260px] bg-zinc-50/50 dark:bg-zinc-950/40 border-b md:border-b-0 md:border-r border-border-main p-6 shrink-0 flex flex-col justify-between">
          <div className="space-y-8">
            {/* Sidebar Title */}
            <div>
              <h2 className="text-[11px] font-medium text-foreground dark:text-zinc-500 uppercase tracking-widest px-2.5">
                Settings
              </h2>
            </div>

            {/* Menu Items */}
            <nav className="space-y-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-[13px] font-medium transition-all duration-150 cursor-pointer focus:outline-none ${
                  activeTab === 'account'
                    ? 'bg-zinc-200/60 dark:bg-zinc-800/80 text-foreground'
                    : 'text-foreground/70 dark:text-zinc-400 hover:text-foreground hover:bg-hover-bg'
                }`}
              >
                <UserIcon className="w-4 h-4 shrink-0 text-foreground/60 dark:text-zinc-400" strokeWidth={1.5} />
                <span>Account</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('appearance')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-[13px] font-medium transition-all duration-150 cursor-pointer focus:outline-none ${
                  activeTab === 'appearance'
                    ? 'bg-zinc-200/60 dark:bg-zinc-800/80 text-foreground'
                    : 'text-foreground/70 dark:text-zinc-400 hover:text-foreground hover:bg-hover-bg'
                }`}
              >
                <Paintbrush className="w-4 h-4 shrink-0 text-foreground/60 dark:text-zinc-400" strokeWidth={1.5} />
                <span>Appearance</span>
              </button>
            </nav>
          </div>

          {/* Footer Info inside Left Sidebar */}
          <div className="hidden md:block px-2.5 py-1 text-[13px] text-foreground/60 dark:text-zinc-500 font-normal">
            Leanity App v1.0.0
          </div>
        </div>

        {/* Right Content Panel (flex-1) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-surface relative">
          {/* Close Button Top Right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-hover-bg rounded-md text-foreground/60 dark:text-zinc-400 hover:text-foreground transition-all duration-150 cursor-pointer z-10 focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-8 md:p-12">
            
            {/* Account Tab Content */}
            {activeTab === 'account' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Section Header */}
                <div>
                  <h3 className="text-[18px] font-medium text-foreground">Account</h3>
                  <p className="text-[13px] text-foreground/80 dark:text-zinc-400 mt-1 font-normal">
                    Manage your personal profile and sync status.
                  </p>
                </div>

                <div className="h-px bg-border-main" />

                {/* Profile Row Card */}
                <div className="p-5 rounded-md border border-border-main bg-zinc-50/20 dark:bg-zinc-950/10 flex items-center justify-between">
                  <div className="flex items-center gap-4.5">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-medium shadow-sm ${avatarBg}`}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-foreground text-[13px] truncate">{displayName}</h4>
                      <p className="text-[13px] text-foreground/70 dark:text-zinc-400 truncate mt-0.5 font-normal">{email}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[13px] font-normal bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    Local Mode
                  </span>
                </div>

                {/* System Settings Status Rows */}
                <div className="space-y-4">
                  <h4 className="text-[13px] font-medium text-foreground/50 dark:text-zinc-500 uppercase tracking-wider">
                    System Information
                  </h4>
                  
                  <div className="space-y-2.5">
                    <div className="p-4.5 rounded-md border border-border-main bg-surface flex items-center justify-between">
                      <div>
                        <h5 className="text-[13px] font-medium text-foreground">Database</h5>
                      </div>
                      <span className="text-[13px] font-normal text-foreground flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                        IndexedDB
                      </span>
                    </div>

                    <div className="p-4.5 rounded-md border border-border-main bg-surface flex items-center justify-between">
                      <div>
                        <h5 className="text-[13px] font-medium text-foreground">Sync status</h5>
                      </div>
                      <span className="text-[13px] font-normal text-foreground">Synced</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab Content */}
            {activeTab === 'appearance' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Section Header */}
                <div>
                  <h3 className="text-[18px] font-medium text-foreground">Appearance</h3>
                  <p className="text-[13px] text-foreground/80 dark:text-zinc-400 mt-1 font-normal">
                    Configure the app's visual theme and text sizes.
                  </p>
                </div>

                <div className="h-px bg-border-main" />

                {/* Appearance Rows Container (Bento style rounded-md cards) */}
                <div className="space-y-4">
                  
                  {/* Theme Select Row */}
                  <div className="p-5 rounded-md border border-border-main bg-zinc-50/10 dark:bg-zinc-950/5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="text-[13px] font-medium text-foreground">Interface theme</h4>
                    </div>
                    <CustomSelect
                      options={themeOptions}
                      value={theme}
                      onChange={onThemeChange}
                    />
                  </div>

                  {/* Font Size Select Row */}
                  <div className="p-5 rounded-md border border-border-main bg-zinc-50/10 dark:bg-zinc-950/5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="text-[13px] font-medium text-foreground">Font size</h4>
                    </div>
                    <CustomSelect
                      options={fontSizeOptions}
                      value={fontSize}
                      onChange={onFontSizeChange}
                    />
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
