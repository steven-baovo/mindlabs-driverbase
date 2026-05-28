import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, ShieldCheck, Heart } from 'lucide-react'
import { articles } from '../data'
import DocsFeedback from './DocsFeedback'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// 1. Static Parameter Generation (Pre-renders all document paths at build time)
export async function generateStaticParams() {
  return articles.map(article => ({
    slug: article.id,
  }))
}

// 2. Dynamic SEO Metadata Generation (Unique titles & descriptions for each guide)
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const article = articles.find(a => a.id === slug)
  if (!article) {
    return {
      title: 'Tài liệu không tìm thấy | Leanity Docs',
    }
  }

  return {
    title: `${article.title} | Leanity Docs`,
    description: article.description,
    alternates: {
      canonical: `/docs/${slug}`,
    },
  }
}

export default async function DocArticlePage({ params }: PageProps) {
  const { slug } = await params
  const activeIndex = articles.findIndex(a => a.id === slug)
  if (activeIndex === -1) {
    notFound()
  }

  const activeArticle = articles[activeIndex]
  const prevArticle = activeIndex > 0 ? articles[activeIndex - 1] : null
  const nextArticle = activeIndex < articles.length - 1 ? articles[activeIndex + 1] : null
  const IconComponent = activeArticle.icon

  return (
    <main className="flex-1 flex min-w-0 bg-white p-6 md:p-12 overflow-y-auto">
      
      {/* Article content & footer */}
      <div className="flex-1 max-w-[720px] space-y-12">
        <article className="space-y-8 animate-in fade-in duration-300">
          
          {/* Breadcrumbs (Thân thiện SEO) */}
          <nav className="flex items-center space-x-2 text-[13px] text-zinc-400 font-normal uppercase tracking-wider select-none">
            <Link 
              href="/docs" 
              className="hover:text-zinc-700 transition-colors font-normal text-[13px]"
            >
              Reference
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-normal text-[13px] text-zinc-400">{activeArticle.categoryLabel}</span>
          </nav>

          {/* Header Title & Intro */}
          <header className="space-y-4 pb-6">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded bg-[#5e6ad2]/5 border border-[#5e6ad2]/10 flex items-center justify-center text-[#5e6ad2] shrink-0">
                <IconComponent className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950">
                {activeArticle.title}
              </h1>
            </div>
            <p className="text-zinc-500 text-[13px] font-normal max-w-2xl leading-relaxed">
              {activeArticle.description}
            </p>
          </header>

          {/* Dynamic Article Content Body */}
          <div className="article-body-content prose prose-zinc max-w-none text-[13px] font-normal text-zinc-600">
            {activeArticle.content}
          </div>

          {/* Feedback & Bottom Prev/Next navigation */}
          <footer className="pt-8 space-y-6">
            
            {/* Interactive Feedback component */}
            <DocsFeedback />

            {/* Next / Prev Navigation */}
            <div className="grid grid-cols-2 gap-4 font-normal">
              {prevArticle ? (
                <Link
                  href={`/docs/${prevArticle.id}`}
                  className="bg-white border border-zinc-200 hover:border-zinc-300 p-4 rounded text-left group shadow-subtle hover:scale-[1.005] transition-all cursor-pointer font-normal block"
                >
                  <span className="text-[13px] font-normal text-zinc-400 uppercase tracking-widest block">Bài viết trước</span>
                  <span className="block text-[13px] font-normal text-zinc-800 text-left mt-1.5 truncate group-hover:text-[#5e6ad2] transition-colors">{prevArticle.title}</span>
                </Link>
              ) : <div />}

              {nextArticle ? (
                <Link
                  href={`/docs/${nextArticle.id}`}
                  className="bg-white border border-zinc-200 hover:border-zinc-300 p-4 rounded text-right group shadow-subtle hover:scale-[1.005] transition-all cursor-pointer block ml-auto w-full font-normal"
                >
                  <span className="text-[13px] font-normal text-zinc-400 uppercase tracking-widest block">Bài tiếp theo</span>
                  <span className="block text-[13px] font-normal text-zinc-800 text-right mt-1.5 truncate group-hover:text-[#5e6ad2] transition-colors">{nextArticle.title}</span>
                </Link>
              ) : <div />}
            </div>

          </footer>

        </article>
      </div>

      {/* 3. TABLE OF CONTENTS (Right Side Panel - Desktop Only) */}
      <aside className="hidden xl:block w-52 shrink-0 pl-8 select-none font-normal">
        <div className="sticky top-20 space-y-4 font-normal">
          <h3 className="text-[13px] font-normal text-zinc-400 uppercase tracking-wider px-2">Trên trang này</h3>
          <nav className="space-y-1 font-normal">
            {activeArticle.subheadings.map(sub => (
              <a
                key={sub.id}
                href={`#${sub.id}`}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-zinc-50 text-[13px] font-normal text-zinc-500 hover:text-zinc-950 transition-colors truncate block"
              >
                {sub.title}
              </a>
            ))}
          </nav>
        </div>
      </aside>

    </main>
  )
}
