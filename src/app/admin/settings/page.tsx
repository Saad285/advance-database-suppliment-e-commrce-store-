import { createServerSupabase } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const supabase = await createServerSupabase()

  const { data: settings } = await supabase
    .from('settings')
    .select('*')

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Store Settings</h1>
      <p className="text-zinc-400 mb-8">Manage global store configurations like shipping fee and free shipping thresholds.</p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
        <SettingsClient initialSettings={settings || []} />
      </div>
    </div>
  )
}
