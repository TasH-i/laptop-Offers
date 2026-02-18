// components/Admin/AdminHeader.tsx (UPDATED - Scaled Up, No Search)

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import {
  Menu,
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
  const menuRef = useRef<HTMLDivElement>(null)

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

  const handleSignOut = async () => {
    setShowUserMenu(false)
    toast.info('Signing you out...')
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <>
      <header className="h-[80px] bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-8 lg:px-10 shrink-0 sticky top-0 z-30">
        {/* Left */}
        <div className="flex items-center gap-5">
          <button onClick={onMenuClick}
            className="lg:hidden w-11 h-11 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <Menu size={24} />
          </button>

          <div className="hidden md:block">
            <p className="text-[16px] font-semibold text-gray-800">Admin Panel</p>
            <p className="text-[13px] text-gray-400">LaptopOffers.lk</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="w-11 h-11 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors relative">
            <Bell size={22} />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-brand-red rounded-full ring-2 ring-white" />
          </button>

          {/* Divider */}
          <div className="w-px h-10 bg-gray-100 mx-2" />

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {user.image ? (
                  <Image src={user.image} alt={user.name || ''} width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] flex items-center justify-center">
                    <span className="text-white font-bold text-[13px]">{initials}</span>
                  </div>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[15px] font-semibold text-gray-800 leading-tight">{user.name || 'Admin'}</p>
                <p className="text-[12px] text-gray-400 leading-tight">Administrator</p>
              </div>
              <ChevronDown size={18} className={`hidden md:block text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>


          </div>
        </div>
      </header>
      {/* Dropdown */}
      {showUserMenu && (
        <div className="absolute right-4 top-15 mt-3 w-64 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-60">
          <div className="px-5 py-4 border-b border-gray-50">
            <p className="text-[15px] font-semibold text-gray-800">{user.name}</p>
            <p className="text-[13px] text-gray-400 truncate mt-1">{user.email}</p>
          </div>

          {/* <div className="py-2">
                <Link href="/account" onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-5 py-3 text-[15px] text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors">
                  <User size={18} /> My Account
                </Link>
                <Link href="/" onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-5 py-3 text-[15px] text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors">
                  <ExternalLink size={18} /> View Store
                </Link>
              </div> */}

          <div className="border-t border-gray-50 py-2">
            <button onClick={handleSignOut}
              className="flex items-center gap-3 px-5 py-3 w-full text-[15px] text-red-500 hover:bg-red-50 transition-colors">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  )
}