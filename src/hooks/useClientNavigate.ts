'use client'

/**
 * useClientNavigate — SPA navigation hook
 *
 * Thay thế router.push() của Next.js cho điều hướng nội bộ.
 * Dùng window.history để đổi URL mà không gọi Server → tốc độ 0ms.
 *
 * - navigate(path): tạo history entry mới → nút Back sẽ quay về đây
 * - replace(path):  ghi đè entry hiện tại → nút Back BỎ QUA điểm này
 */
export function useClientNavigate() {
  const navigate = (path: string) => {
    window.history.pushState(null, '', path)
    // Kích hoạt popstate để ClientRouter cập nhật state
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  const replace = (path: string) => {
    window.history.replaceState(null, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return { navigate, replace }
}
