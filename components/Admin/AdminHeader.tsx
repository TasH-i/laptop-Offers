// components/Admin/AdminHeader.tsx

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  ExternalLink,
} from 'lucide-react'

interface AdminHeaderProps {
  onMenuClick: () => void
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

export default function AdminHeader({ onMenuClick, user }: AdminHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A'

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus()
  }, [showSearch])

  const handleSignOut = async () => {
    setShowUserMenu(false)
    toast.info('Signing you out...')
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <header className="h-[68px] bg-white border-b border-gray-100 flex items-center justify-between px-5 md:px-7 lg:px-8 shrink-0 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick}
          className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Menu size={22} />
        </button>

        <div className="hidden md:block">
          <p className="text-[15px] font-semibold text-gray-800">Admin Panel</p>
          <p className="text-[12px] text-gray-400">LaptopOffers.lk</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="relative">
          {showSearch ? (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-72 md:w-96">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
              <input ref={searchRef} type="text" placeholder="Search..."
                onBlur={() => setShowSearch(false)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all" />
            </div>
          ) : (
            <button onClick={() => setShowSearch(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <Search size={20} />
            </button>
          )}
        </div>

        {/* Notifications */}
        <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-red rounded-full ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-9 bg-gray-100 mx-1.5" />

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              {user.image ? (
                <Image src={user.image} alt={user.name || ''} width={36} height={36} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] flex items-center justify-center">
                  <span className="text-white font-bold text-[12px]">{initials}</span>
                </div>
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[14px] font-semibold text-gray-800 leading-tight">{user.name || 'Admin'}</p>
              <p className="text-[11px] text-gray-400 leading-tight">Administrator</p>
            </div>
            <ChevronDown size={16} className={`hidden md:block text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3.5 border-b border-gray-50">
                <p className="text-[14px] font-semibold text-gray-800">{user.name}</p>
                <p className="text-[12px] text-gray-400 truncate mt-0.5">{user.email}</p>
              </div>

              <div className="py-2">
                <Link href="/account" onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors">
                  <User size={16} /> My Account
                </Link>
                <Link href="/" onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors">
                  <ExternalLink size={16} /> View Store
                </Link>
              </div>

              <div className="border-t border-gray-50 py-2">
                <button onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-2.5 w-full text-[14px] text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}