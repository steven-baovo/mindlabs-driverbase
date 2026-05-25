'use server'

import { createClient, getAuthUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const displayName = formData.get('displayName') as string
  const user = await getAuthUser()
  if (!user) return { error: 'Bạn chưa đăng nhập' }
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/account')
  revalidatePath('/', 'layout')
  return { success: 'Cập nhật thông tin thành công' }
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { error: 'Mật khẩu xác nhận không khớp' }
  }

  if (password.length < 6) {
    return { error: 'Mật khẩu phải có ít nhất 6 ký tự' }
  }

  const supabase = await createClient()
  const user = await getAuthUser()
  if (!user) return { error: 'Bạn chưa đăng nhập' }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Đổi mật khẩu thành công' }
}

export async function uploadAvatar(formData: FormData) {
  const file = formData.get('avatar') as File
  if (!file || file.size === 0) {
    return { error: 'Vui lòng chọn ảnh' }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Dung lượng ảnh phải nhỏ hơn 5MB' }
  }

  const user = await getAuthUser()
  if (!user) return { error: 'Bạn chưa đăng nhập' }
  const supabase = await createClient()

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    return { error: uploadError.message }
  }

  // Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  // Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/account')
  revalidatePath('/', 'layout')
  return { success: 'Cập nhật ảnh đại diện thành công', url: publicUrl }
}
