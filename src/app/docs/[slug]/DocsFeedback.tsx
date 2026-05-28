'use client'

import React, { useState } from 'react'
import { Smile } from 'lucide-react'

export default function DocsFeedback() {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<string | null>(null)

  return (
    <div className="p-6 bg-zinc-50 border border-zinc-200 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-normal">
      <div className="space-y-1 font-normal">
        <h4 className="text-xs font-bold text-zinc-900">Bài viết này có hữu ích cho bạn không?</h4>
        <p className="text-[13px] text-zinc-400 font-normal">Phản hồi của bạn giúp chúng tôi nâng cấp tài liệu tốt hơn.</p>
      </div>

      <div className="flex items-center space-x-2 font-normal">
        {feedbackSubmitted ? (
          <div className="flex items-center space-x-1.5 text-emerald-600 text-[13px] font-normal">
            <Smile className="w-4.5 h-4.5" />
            <span className="font-normal text-[13px]">Cảm ơn phản hồi quý giá của bạn!</span>
          </div>
        ) : (
          <>
            <button
              onClick={() => setFeedbackSubmitted('yes')}
              className="px-3.5 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 text-[13px] font-normal rounded shadow-subtle transition-all cursor-pointer"
            >
              👍 Có, hữu ích
            </button>
            <button
              onClick={() => setFeedbackSubmitted('no')}
              className="px-3.5 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 text-[13px] font-normal rounded shadow-subtle transition-all cursor-pointer"
            >
              👎 Chưa hữu ích
            </button>
          </>
        )}
      </div>
    </div>
  )
}
