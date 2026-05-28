'use client';

import { useEffect } from 'react';
import { useQuickCreate } from '@/contexts/QuickCreateContext';

/**
 * Lắng nghe phím `C` toàn cục.
 * Bỏ qua khi đang nhập liệu trong: input, textarea, [contenteditable], select.
 */
export default function GlobalKeyboardListener() {
  const { isOpen, open } = useQuickCreate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua khi modal đang mở
      if (isOpen) return;

      // Bỏ qua khi đang nhập liệu
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) return;

      // Bỏ qua khi có modifier key (Ctrl+C, Cmd+C...)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        open();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, open]);

  return null;
}
