'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateSetting(key: string, value: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('settings')
    .update({ value })
    .eq('key', key)

  if (error) throw new Error(error.message)
  
  // Revalidate everything since settings can affect checkout, etc.
  revalidatePath('/', 'layout')
}
