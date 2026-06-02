import { createServerSupabase } from '@/lib/supabase/server'
import AuthForm from './AuthForm'
import Link from 'next/link'
import { LogOut, Package, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 md:py-28">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium mb-3">Account</p>
          <h1 className="text-3xl font-light text-white tracking-tight mb-2">Welcome back</h1>
          <p className="text-sm text-zinc-500">Sign in or create a new account.</p>
        </div>
        <AuthForm />
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-28">
      <p className="text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium mb-3">Account</p>
      <h1 className="text-3xl font-light text-white tracking-tight mb-12">
        {profile?.full_name || 'Welcome'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-white/[0.04]">
        <Link
          href="/account/orders"
          className="group bg-[#0a0a0a] hover:bg-[#111] transition-colors duration-200 p-8 flex flex-col justify-between min-h-[180px]"
        >
          <Package className="w-5 h-5 text-zinc-500 group-hover:text-primary transition-colors" />
          <div>
            <h3 className="text-base font-normal text-white mb-1">Order History</h3>
            <p className="text-xs text-zinc-500">View past orders and track status.</p>
          </div>
        </Link>

        <form action="/auth/signout" method="post" className="contents">
          <button
            type="submit"
            className="group bg-[#0a0a0a] hover:bg-[#111] transition-colors duration-200 p-8 flex flex-col justify-between min-h-[180px] text-left w-full"
          >
            <LogOut className="w-5 h-5 text-zinc-500 group-hover:text-red-400 transition-colors" />
            <div>
              <h3 className="text-base font-normal text-white mb-1">Sign Out</h3>
              <p className="text-xs text-zinc-500">{user.email}</p>
            </div>
          </button>
        </form>

        {profile?.role === 'admin' && (
          <Link
            href="/admin"
            className="group bg-[#0a0a0a] hover:bg-[#111] transition-colors duration-200 p-8 flex flex-col justify-between min-h-[180px] md:col-span-2"
          >
            <ShieldCheck className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-base font-normal text-white mb-1">Admin Dashboard</h3>
              <p className="text-xs text-zinc-500">Manage products, orders, and settings.</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
