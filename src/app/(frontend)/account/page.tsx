import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccountForm from './AccountForm'

export const metadata = {
  title: 'Cài đặt tài khoản | Mindlabs',
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 md:px-6">
      <div className="mb-8 border-b border-[#e5e5e5] pb-6">
        <h1 className="text-3xl font-bold text-[#1a2b49] mb-2">Cài đặt tài khoản</h1>
        <p className="text-gray-500">Quản lý thông tin cá nhân, ảnh đại diện và bảo mật.</p>
      </div>

      <AccountForm user={user} profile={profile || {}} />
    </div>
  )
}
