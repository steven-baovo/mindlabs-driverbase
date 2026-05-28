'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import { 
  BookOpen, 
  ChevronDown, 
  ChevronRight,
  ArrowRight, 
  Search, 
  Keyboard, 
  X,
  Layers,
  Compass,
  HelpCircle
} from 'lucide-react'
import { articles, SectionId } from './data'

export default function DocsLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const activeSection = pathname === '/docs' ? 'reference' : pathname.replace('/docs/', '')
  
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Trạng thái thu gọn/mở rộng các danh mục ở sidebar
  const [expandedCategories, setExpandedCategories] = useState({
    tutorials: true,
    features: true,
    guides: true
  })

  const searchInputRef = useRef<HTMLInputElement>(null)
  const resultListRef = useRef<HTMLDivElement>(null)

  // Đóng/mở danh mục
  const toggleCategory = (cat: 'tutorials' | 'features' | 'guides') => {
    setExpandedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }))
  }

  // Lắng nghe phím tắt Ctrl + K toàn cầu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus ô tìm kiếm khi Command Palette mở
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
      setSelectedIndex(0)
    }
  }, [searchOpen])

  // Reset active menu khi chuyển trang
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Danh sách các kết quả tìm kiếm cho Command Palette
  const searchResults = searchQuery.trim() === ''
    ? []
    : articles.flatMap(article => {
        const matches: { title: string; subtitle: string; articleId: SectionId; subheadingId?: string }[] = []
        
        // Kiểm tra tiêu đề bài viết
        if (article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            article.description.toLowerCase().includes(searchQuery.toLowerCase())) {
          matches.push({
            title: article.title,
            subtitle: article.categoryLabel,
            articleId: article.id
          })
        }
        
        // Kiểm tra các tiêu đề con
        article.subheadings.forEach(sub => {
          if (sub.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            matches.push({
              title: sub.title,
              subtitle: `Trong bài: ${article.title}`,
              articleId: article.id,
              subheadingId: sub.id
            })
          }
        })
        
        return matches
      })

  // Xử lý di chuyển phím Lên/Xuống/Enter trong danh sách tìm kiếm
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % searchResults.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = searchResults[selectedIndex]
      handleSelectSearchResult(selected.articleId, selected.subheadingId)
    } else if (e.key === 'Escape') {
      setSearchOpen(false)
    }
  }

  // Khi chọn một kết quả tìm kiếm
  const handleSelectSearchResult = (articleId: SectionId, subheadingId?: string) => {
    setSearchOpen(false)
    setSearchQuery('')
    setMobileMenuOpen(false)
    
    router.push(`/docs/${articleId}`)

    if (subheadingId) {
      setTimeout(() => {
        const el = document.getElementById(subheadingId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 350) // Chờ trang tải và render xong
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col relative select-none">
      
      {/* 1. GLASSMORPHIC TOP NAVBAR (Căn giữa tối đa 1440px - Sử dụng Header chung) */}
      <Header 
        onSearchClick={() => setSearchOpen(true)}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        isMobileMenuOpen={mobileMenuOpen}
      />

      {/* 2. MAIN DOCS CONTAINER (Căn giữa tối đa 1440px) */}
      <div className="flex-1 flex w-full bg-white">
        <div className="max-w-[1440px] mx-auto w-full flex relative">
          
          {/* LEFT SIDEBAR (Desktop & Mobile) */}
          <aside className={`
            fixed lg:sticky top-14 left-0 h-[calc(100vh-56px)] w-60 border-r border-zinc-200 bg-zinc-50/70 lg:bg-white z-30 flex flex-col p-4 overflow-y-auto no-scrollbar transition-transform duration-300
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="space-y-6">
              
              {/* Mobile search */}
              <div className="block md:hidden pb-2 border-b border-zinc-200">
                <button
                  onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }}
                  className="w-full h-8 bg-white border border-zinc-200 rounded px-2.5 flex items-center justify-between text-[13px] text-zinc-400 font-normal cursor-pointer"
                >
                  <span className="flex items-center space-x-1.5 font-normal"><Search className="w-3.5 h-3.5" /> <span className="text-[13px] font-normal">Tìm kiếm...</span></span>
                </button>
              </div>

              {/* Hướng dẫn cơ bản */}
              <div className="space-y-1">
                <div
                  onClick={() => toggleCategory('tutorials')}
                  className="w-full flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-zinc-200/40 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-400/80 shrink-0" />
                    <span className="text-[13px] font-normal">Hướng dẫn cơ bản</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleCategory('tutorials')
                    }}
                    className="p-0.5 rounded hover:bg-zinc-300 text-zinc-400 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transform transition-transform duration-200 ${expandedCategories.tutorials ? '' : '-rotate-90'}`} />
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {expandedCategories.tutorials && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pl-3 ml-3 border-l border-zinc-200/80 flex flex-col gap-0.5 mt-0.5"
                    >
                      {articles.filter(a => a.category === 'tutorials').map(article => {
                        const isActive = activeSection === article.id
                        return (
                          <Link
                            key={article.id}
                            href={`/docs/${article.id}`}
                            className={`w-full flex items-center px-3.5 py-1.5 rounded text-[13px] font-normal transition-all text-left cursor-pointer ${
                              isActive
                                ? 'bg-[#5e6ad2]/10 text-[#5e6ad2]'
                                : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-950'
                            }`}
                          >
                            <span className="truncate text-[13px] font-normal">{article.title}</span>
                          </Link>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tính năng chi tiết */}
              <div className="space-y-1">
                <div
                  onClick={() => toggleCategory('features')}
                  className="w-full flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-zinc-200/40 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-zinc-400/80 shrink-0" />
                    <span className="text-[13px] font-normal">Tính năng chi tiết</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleCategory('features')
                    }}
                    className="p-0.5 rounded hover:bg-zinc-300 text-zinc-400 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transform transition-transform duration-200 ${expandedCategories.features ? '' : '-rotate-90'}`} />
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {expandedCategories.features && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pl-3 ml-3 border-l border-zinc-200/80 flex flex-col gap-0.5 mt-0.5"
                    >
                      {articles.filter(a => a.category === 'features').map(article => {
                        const isActive = activeSection === article.id
                        return (
                          <Link
                            key={article.id}
                            href={`/docs/${article.id}`}
                            className={`w-full flex items-center px-3.5 py-1.5 rounded text-[13px] font-normal transition-all text-left cursor-pointer ${
                              isActive
                                ? 'bg-[#5e6ad2]/10 text-[#5e6ad2]'
                                : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-950'
                            }`}
                          >
                            <span className="truncate text-[13px] font-normal">{article.title}</span>
                          </Link>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mẹo & Hướng dẫn */}
              <div className="space-y-1">
                <div
                  onClick={() => toggleCategory('guides')}
                  className="w-full flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-zinc-200/40 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-zinc-400/80 shrink-0" />
                    <span className="text-[13px] font-normal">Mẹo & Hướng dẫn</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleCategory('guides')
                    }}
                    className="p-0.5 rounded hover:bg-zinc-300 text-zinc-400 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transform transition-transform duration-200 ${expandedCategories.guides ? '' : '-rotate-90'}`} />
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {expandedCategories.guides && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pl-3 ml-3 border-l border-zinc-200/80 flex flex-col gap-0.5 mt-0.5"
                    >
                      {articles.filter(a => a.category === 'guides').map(article => {
                        const isActive = activeSection === article.id
                        return (
                          <Link
                            key={article.id}
                            href={`/docs/${article.id}`}
                            className={`w-full flex items-center px-3.5 py-1.5 rounded text-[13px] font-normal transition-all text-left cursor-pointer ${
                              isActive
                                ? 'bg-[#5e6ad2]/10 text-[#5e6ad2]'
                                : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-950'
                            }`}
                          >
                            <span className="truncate text-[13px] font-normal">{article.title}</span>
                          </Link>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </aside>

          {/* Mobile menu overlay backdrop */}
          {mobileMenuOpen && (
            <div 
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-14 bg-zinc-950/20 backdrop-blur-xs z-20 lg:hidden"
            />
          )}

          {/* MAIN ARTICLE CONTENT CONTAINER */}
          {children}

        </div>
      </div>

      {/* 4. COMMAND PALETTE SEARCH MODAL (Ctrl + K) */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 select-none font-normal">
            
            {/* Dark blur backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-zinc-900/15 backdrop-blur-xs"
            />

            {/* Modal Body Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="bg-white border border-zinc-200/90 rounded shadow-overlay w-full max-w-xl overflow-hidden z-10 flex flex-col relative font-normal"
              onKeyDown={handleSearchKeyDown}
            >
              
              {/* Search input wrap */}
              <div className="flex items-center px-4 py-3.5 border-b border-zinc-200 font-normal">
                <Search className="w-4.5 h-4.5 text-zinc-400 mr-3 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Tìm kiếm tài liệu, tiêu đề phụ, phím tắt..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSelectedIndex(0); }}
                  className="flex-1 bg-transparent border-0 outline-none text-zinc-900 text-[13px] placeholder-zinc-400 font-normal"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer flex items-center justify-center"
                  aria-label="Đóng tìm kiếm"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Results area */}
              <div ref={resultListRef} className="max-h-80 overflow-y-auto no-scrollbar py-2 font-normal">
                {searchQuery.trim() === '' ? (
                  
                  /* Initial display when search is empty */
                  <div className="px-5 py-6 text-center space-y-2 font-normal">
                    <Keyboard className="w-7 h-7 text-zinc-300 mx-auto" />
                    <h4 className="text-[13px] font-normal text-zinc-800">Tìm kiếm nhanh tài liệu</h4>
                    <p className="text-[13px] font-normal text-zinc-400 max-w-xs mx-auto leading-relaxed">
                      Nhập từ khóa bất kỳ để tìm kiếm nhanh bài viết hoặc tiêu đề phụ trong hệ sinh thái Leanity.
                    </p>
                  </div>

                ) : searchResults.length > 0 ? (
                  
                  /* Matching search results */
                  <div className="space-y-0.5 px-2 font-normal">
                    {searchResults.map((result, idx) => {
                      const isFocused = idx === selectedIndex
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectSearchResult(result.articleId, result.subheadingId)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-left cursor-pointer transition-all ${
                            isFocused 
                              ? 'bg-[#5e6ad2]/10 text-[#5e6ad2] font-normal' 
                              : 'text-zinc-600 hover:bg-zinc-50'
                          }`}
                        >
                          <div className="min-w-0 pr-4 font-normal">
                            <span className="block text-[13px] truncate leading-snug font-normal">{result.title}</span>
                            <span className="block text-[13px] font-normal text-zinc-400 mt-0.5 truncate">{result.subtitle}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
                        </button>
                      )
                    })}
                  </div>

                ) : (
                  
                  /* Empty state when no match is found */
                  <div className="px-5 py-8 text-center space-y-2 text-zinc-400 font-normal">
                    <HelpCircle className="w-6 h-6 mx-auto text-zinc-300" />
                    <p className="text-[13px] font-normal">Không tìm thấy kết quả phù hợp cho "{searchQuery}"</p>
                  </div>

                )}
              </div>

              {/* Bottom Hotkeys legend */}
              <div className="bg-zinc-50 px-4 py-2 border-t border-zinc-200 flex items-center justify-between text-[13px] text-zinc-400 font-normal select-none">
                <div className="flex items-center space-x-3 font-normal">
                  <span className="flex items-center gap-1 font-normal"><kbd className="px-1 border border-zinc-200 bg-white rounded shadow-xs font-normal">↑↓</kbd> Di chuyển</span>
                  <span className="flex items-center gap-1 font-normal"><kbd className="px-1 border border-zinc-200 bg-white rounded shadow-xs font-normal">Enter</kbd> Chọn</span>
                </div>
                <span className="font-normal">ESC để đóng</span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}
