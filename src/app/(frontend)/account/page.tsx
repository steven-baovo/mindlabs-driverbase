import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'

export const metadata = {
  title: 'Cài đặt tài khoản | Leanity',
}

export default async function AccountPage() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 md:px-6">
      <div className="mb-8 border-b border-[#e5e5e5] pb-6">
        <h1 className="text-3xl font-bold text-[#1a2b49] mb-2">Cài đặt tài khoản</h1>
        <p className="text-gray-500">Quản lý thông tin cá nhân (Đồng bộ qua Google).</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-6">
          {user.image && (
            <Image 
              src={user.image} 
              alt="Avatar" 
              width={80} 
              height={80} 
              className="rounded-full shadow-sm"
            />
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Tài khoản của bạn đang được liên kết với Google Drive để đồng bộ hóa dữ liệu an toàn theo mô hình Local-first.
          </p>
        </div>
      </div>
    </div>
  )
}
