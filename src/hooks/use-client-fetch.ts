import { useState, useEffect } from 'react'

interface FetchResult<T> {
  data: T | null
  error: string | null
}

/**
 * Hook hỗ trợ fetch dữ liệu ở Client với trạng thái loading
 * @param fetchFn Hàm fetch dữ liệu, trả về { data, error }
 * @param deps Array dependencies để trigger fetch lại
 */
export function useClientFetch<T>(
  fetchFn: () => Promise<FetchResult<T>>, 
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    
    async function executeFetch() {
      setLoading(true)
      try {
        const result = await fetchFn()
        if (isMounted) {
          if (result.error) {
            setError(result.error)
          } else {
            setData(result.data)
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Lỗi không xác định')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    executeFetch()

    return () => {
      isMounted = false
    }
  }, deps)

  return { data, loading, error, setData }
}
