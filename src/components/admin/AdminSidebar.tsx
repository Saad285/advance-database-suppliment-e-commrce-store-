'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Tags, Settings, ArrowLeft } from 'lucide-react'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/categories', icon: Tags, label: 'Categories' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-zinc-950 border-r border-zinc-800 flex-col hidden md:flex">
      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="mb-6 px-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Admin Panel</p>
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <Link 
          href="/account"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Account
        </Link>
      </div>
    </aside>
  )
}
