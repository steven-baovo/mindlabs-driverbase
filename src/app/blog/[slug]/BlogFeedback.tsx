'use client'

import React, { useState, useEffect } from 'react'
import { Heart, Share2, Check } from 'lucide-react'

interface BlogFeedbackProps {
  postId: string
  postTitle: string
}

export default function BlogFeedback({ postId, postTitle }: BlogFeedbackProps) {
  const [liked, setLiked] = useState<boolean>(false)
  const [shareSuccess, setShareSuccess] = useState<boolean>(false)

  // Sync like status with localStorage on mount
  useEffect(() => {
    try {
      const storedLikes = localStorage.getItem('leanity_blog_likes')
      if (storedLikes) {
        const likesArray = JSON.parse(storedLikes)
        if (likesArray.includes(postId)) {
          setLiked(true)
        }
      }
    } catch (e) {
      console.error('Error accessing localStorage:', e)
    }
  }, [postId])

  const handleLike = () => {
    try {
      const storedLikes = localStorage.getItem('leanity_blog_likes')
      let likesArray: string[] = storedLikes ? JSON.parse(storedLikes) : []

      if (liked) {
        likesArray = likesArray.filter(id => id !== postId)
        setLiked(false)
      } else {
        likesArray.push(postId)
        setLiked(true)
      }
      localStorage.setItem('leanity_blog_likes', JSON.stringify(likesArray))
    } catch (e) {
      console.error('Error saving like to localStorage:', e)
    }
  }

  const handleShare = () => {
    try {
      const url = window.location.href
      navigator.clipboard.writeText(url)
      setShareSuccess(true)
      setTimeout(() => {
        setShareSuccess(false)
      }, 2000)
    } catch (e) {
      console.error('Error copying text:', e)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6 border-t border-b border-zinc-200/80 dark:border-zinc-800/80 text-[13px] text-zinc-500 dark:text-zinc-400 select-none">
      
      {/* Interactive buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleLike}
          className={`px-3.5 py-1.5 rounded-md border text-[13px] font-normal shadow-subtle active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none ${
            liked
              ? 'border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-950/15 text-red-500 hover:bg-red-50/60 dark:hover:bg-red-950/25'
              : 'border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-450 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
          aria-label={liked ? 'Bỏ thích bài viết' : 'Thích bài viết'}
        >
          <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-red-500 text-red-500' : ''}`} />
          <span>{liked ? 'Đã thích' : 'Thích bài viết'}</span>
        </button>

        <button
          onClick={handleShare}
          className="px-3.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-450 hover:text-zinc-850 dark:hover:text-zinc-200 text-[13px] font-normal shadow-subtle active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none"
          aria-label="Chia sẻ bài viết này"
        >
          {shareSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-500 animate-in fade-in duration-200" />
              <span className="text-emerald-600 dark:text-emerald-500">Đã sao chép!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[12px] text-zinc-400 dark:text-zinc-500 font-normal">
          Tác giả: <strong className="font-semibold text-zinc-700 dark:text-zinc-350">Ban Biên Tập Leanity</strong>
        </span>
      </div>
    </div>
  )
}
