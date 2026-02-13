// components/Auth/UserMenu.tsx

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import {
  User,
  LogOut,
  Settings,
  ShoppingBag,
  Heart,
  Shield,
  ChevronDown,
} from 'lucide-react'

interface UserMenuProps {
  isMobile?: boolean
}

export default function UserMenu({ isMobile = false }: UserMenuProps) {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    setIsOpen(false)
    toast.info('Signing out...')
    await signOut({ callbackUrl: '/' })
    toast.success('You have been signed out successfully.')
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    )
  }

  // Not logged in - show sign in link
  if (!session) {
    if (isMobile) {
      return (
        <Link
          href="/login"
          className="flex items-center gap-3 py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-red rounded-lg transition-colors"
        >
          <Image
            src="/images/04.webp"
            alt="Account"
            width={16}
            height={16}
          />
          <span>ACCOUNT / SIGN IN</span>
        </Link>
      )
    }

    return (
      <Link
        href="/login"
        className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-brand-red transition-colors"
      >
        <Image
          src="/images/04.webp"
          alt="Account"
          width={12}
          height={12}
        />
        <span className="tracking-wide">ACCOUNT</span>
        <span className="text-gray-400">|</span>
        <span className="tracking-wide">SIGN IN</span>
      </Link>
    )
  }

  // Logged in - Mobile version
  if (isMobile) {
    return (
      <div className="space-y-1">
        {/* User Info */}
        <div className="flex items-center gap-3 py-3 px-4">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              width={36}
              height={36}
              className="rounded-full border-2 border-brand-red"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-brand-red flex items-center justify-center text-white font-bold text-sm">
              {session.user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-gray-800">
              {session.user.name}
            </p>
            <p className="text-xs text-gray-500">{session.user.email}</p>
            {session.user.role === 'admin' && (
              <span className="inline-flex items-center gap-1 text-xs text-brand-red font-semibold mt-0.5">
                <Shield size={10} /> Admin
              </span>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <Link
          href="/account"
          className="flex items-center gap-3 py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-red rounded-lg transition-colors"
        >
          <Settings size={16} />
          <span>MY ACCOUNT</span>
        </Link>
        <Link
          href="/orders"
          className="flex items-center gap-3 py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-red rounded-lg transition-colors"
        >
          <ShoppingBag size={16} />
          <span>MY ORDERS</span>
        </Link>
        {session.user.role === 'admin' && (
          <Link
            href="/admin"
            className="flex items-center gap-3 py-3 px-4 text-sm font-semibold text-brand-red hover:bg-red-50 rounded-lg transition-colors"
          >
            <Shield size={16} />
            <span>ADMIN PANEL</span>
          </Link>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>SIGN OUT</span>
        </button>
      </div>
    )
  }

  // Logged in - Desktop version (dropdown)
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-brand-red transition-colors"
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || 'User'}
            width={24}
            height={24}
            className="rounded-full border border-gray-300"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-brand-red flex items-center justify-center text-white font-bold text-[10px]">
            {session.user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        <span className="tracking-wide max-w-[100px] truncate">
          {session.user.name?.split(' ')[0]?.toUpperCase()}
        </span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800">{session.user.name}</p>
            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            {session.user.role === 'admin' && (
              <span className="inline-flex items-center gap-1 text-xs text-brand-red font-semibold mt-1 bg-red-50 px-2 py-0.5 rounded-full">
                <Shield size={10} /> Admin Account
              </span>
            )}
          </div>

          {/* Menu Links */}
          <div className="py-1">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-red transition-colors"
            >
              <User size={16} />
              My Account
            </Link>
            <Link
              href="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-red transition-colors"
            >
              <ShoppingBag size={16} />
              My Orders
            </Link>
            <Link
              href="/favorites"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-red transition-colors"
            >
              <Heart size={16} />
              Favorites
            </Link>
            <Link
              href="/account/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-red transition-colors"
            >
              <Settings size={16} />
              Settings
            </Link>
          </div>

          {/* Admin Link */}
          {session.user.role === 'admin' && (
            <div className="border-t border-gray-100 py-1">
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-red font-medium hover:bg-red-50 transition-colors"
              >
                <Shield size={16} />
                Admin Panel
              </Link>
            </div>
          )}

          {/* Sign Out */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}