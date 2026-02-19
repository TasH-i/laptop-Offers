// components/Admin/AdminSidebar.tsx (UPDATED WITH COMPONENTS)

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  BarChart3,
  Settings,
  Megaphone,
  Layers,
  ChevronLeft,
  X,
  Laptop,
  Group,
  Puzzle,
} from 'lucide-react'
import Image from 'next/image'

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Brands', href: '/admin/brands', icon: Tags },
  { label: 'Laptop Categories', href: '/admin/categories', icon: Layers },
  { label: 'Accessories', href: '/admin/accessories', icon: Group },
  { label: 'Components', href: '/admin/components', icon: Puzzle },
  { label: 'Component Items', href: '/admin/component-items', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Promotions', href: '/admin/promotions', icon: Megaphone },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar({ isOpen, onClose, collapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-[#0f1117] border-r border-white/[0.06] z-50 transition-all duration-300 ${collapsed ? 'w-[100px]' : 'w-[320px]'}`}>
        {/* Logo area */}
        <div className={`flex items-center h-[80px] border-b border-white/[0.06] shrink-0 ${collapsed ? 'justify-center px-3' : 'px-6'}`}>
          {collapsed ? (
            <div className="w-12 h-12 rounded-xl bg-brand-red flex items-center justify-center">
              <Image src="/images/20.webp" alt="Logo" width={28} height={28} className="text-white" />
            </div>
          ) : (
            <Link href="/" className="flex items-center gap-3 ">
              <div className="w-12 h-12 rounded-xl bg-brand- flex items-center justify-center shrink-0">
                <Image src="/images/20.webp" alt="Logo" width={36} height={36} className="text-white" />
              </div>
              <div>
                <Image src="/images/01.webp" alt="Logo" width={155} height={155} className="text-white mt-4" />
                <p className="text-white/30 text-[12px] font-medium">Admin Panel</p>
              </div>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          <div className={`mb-5 ${collapsed ? 'hidden' : ''}`}>
            <p className="text-[12px] font-semibold text-white/20 uppercase tracking-widest px-4">Menu</p>
          </div>

          <div className="space-y-2">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3.5 rounded-xl transition-all duration-200 group relative
                    ${collapsed ? 'justify-center px-0 py-3.5 mx-auto w-14 h-14' : 'px-4 py-3.5'}
                    ${active
                      ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20'
                      : 'text-white/40 hover:text-white/80 hover:bg-white/[0.06]'
                    }`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={22} className={`shrink-0 ${active ? 'text-white' : ''}`} />
                  {!collapsed && <span className="text-[15px] font-medium">{item.label}</span>}

                  {/* Tooltip for collapsed */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-[#1a1b23] text-white text-[13px] font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50">
                      {item.label}
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#1a1b23] rotate-45" />
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-white/[0.06] p-3.5">
          <button onClick={onToggleCollapse}
            className={`flex items-center gap-2.5 w-full rounded-xl py-3.5 text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all ${collapsed ? 'justify-center px-0' : 'px-4'}`}>
            <ChevronLeft size={20} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span className="text-[14px] font-medium">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 h-screen w-[300px] bg-[#0f1117] z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Mobile header */}
        <div className="flex items-center justify-between h-[68px] px-6 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center">
              <Laptop size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-[15px] leading-tight">LaptopOffers</p>
              <p className="text-white/30 text-[11px] font-medium">Admin Panel</p>
            </div>
          </Link>
          <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Mobile nav */}
        <nav className="py-5 px-3 overflow-y-auto h-[calc(100%-68px)]">
          <p className="text-[11px] font-semibold text-white/20 uppercase tracking-widest px-4 mb-4">Menu</p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link key={item.href} href={item.href} onClick={onClose}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200
                    ${active
                      ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20'
                      : 'text-white/40 hover:text-white/80 hover:bg-white/[0.06]'
                    }`}
                >
                  <item.icon size={20} />
                  <span className="text-[14px] font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </aside>
    </>
  )
}