import ClientRouter from '@/components/ClientRouter'

/**
 * Catch-all Server Component — bắt MỌI đường dẫn của app frontend.
 * AppRouterProvider đã nằm ở layout, tự đọc pathname từ window.location.
 */
export default function CatchAllPage() {
  return <ClientRouter />
}
