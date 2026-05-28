import React from 'react'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Heart } from 'lucide-react'
import { articles } from './data'

export default function DocsPage() {
  return (
    <main className="flex-1 flex min-w-0 bg-white p-6 md:p-12 overflow-y-auto">
      <div className="flex-1 max-w-3xl space-y-12">
        <div className="space-y-10 animate-in fade-in duration-300">
          <header className="space-y-3">
            <span className="text-[13px] font-normal text-[#5e6ad2] uppercase tracking-widest">Tài liệu tham chiếu</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950">Tài liệu hướng dẫn chuyên sâu (Reference)</h1>
            <p className="text-zinc-500 text-[13px] font-normal max-w-xl leading-relaxed">
              Chào mừng bạn đến với trung tâm tài liệu chính thức của Leanity. Tại đây, bạn sẽ tìm thấy câu trả lộ đầy đủ về các nguyên lý hoạt động của không gian làm việc số và mẹo nâng cao hiệu năng công việc.
            </p>
          </header>

          {/* Topics Grid (Styled like capacities.io landing cards) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {articles.map(article => {
              const CardIcon = article.icon
              return (
                <Link
                  key={article.id}
                  href={`/docs/${article.id}`}
                  className="bg-white border border-zinc-200 hover:border-zinc-300 p-6 rounded text-left group shadow-subtle hover:scale-[1.008] transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="w-8 h-8 rounded bg-zinc-50 border border-zinc-150 flex items-center justify-center text-zinc-500 group-hover:text-[#5e6ad2] group-hover:bg-[#5e6ad2]/5 transition-colors mb-4">
                    <CardIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 group-hover:text-[#5e6ad2] transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-[13px] font-normal text-zinc-400 mt-1.5 leading-relaxed">
                    {article.description}
                  </p>
                  <div className="flex items-center space-x-1.5 text-[13px] font-normal text-[#5e6ad2] mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[13px] font-normal">Xem chi tiết</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              )
            })}
          </section>

          {/* Callout Are you missing something */}
          <section className="p-5 bg-zinc-50 border border-zinc-200 rounded space-y-4 font-normal">
            <h3 className="text-xs font-bold text-zinc-900 flex items-center space-x-2">
              <span className="text-[#5e6ad2]">⚡</span>
              <span>Bạn cần tìm kiếm câu hỏi khác?</span>
            </h3>
            <p className="text-[13px] text-zinc-500 leading-relaxed font-normal">
              Hệ thống tài liệu Leanity liên tục được cập nhật. Bạn có thể nhấn phím tắt <kbd className="px-1.5 py-0.5 border border-zinc-200 bg-white rounded font-mono text-[13px] shadow-xs select-none font-normal">Ctrl + K</kbd> bất kỳ lúc nào để kích hoạt hộp tìm kiếm nhanh và truy xuất bài viết mong muốn ngay tức thì.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
