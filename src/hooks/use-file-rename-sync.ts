import { useEffect } from 'react'

/**
 * Hook lắng nghe sự kiện 'file-renamed' để đồng bộ tên file
 * @param id ID của note hoặc canvas cần lắng nghe
 * @param onRename Callback xử lý khi tên thay đổi
 */
export function useFileRenameSync(id: string, onRename: (title: string) => void) {
  useEffect(() => {
    const handleRenamed = (e: CustomEvent) => {
      const { id: eventId, title } = e.detail
      if (eventId === id) {
        onRename(title)
      }
    }
    
    window.addEventListener('file-renamed', handleRenamed as EventListener)
    
    return () => {
      window.removeEventListener('file-renamed', handleRenamed as EventListener)
    }
  }, [id, onRename])
}
