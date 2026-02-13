// app/account/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, LogOut, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ProfileImageUpload from '@/components/Account/ProfileImageUpload'
import AccountDetailsForm from '@/components/Account/AccountDetailsForm'

interface UserProfile {
  id: string
  name: string
  email: string
  contactNumbers: string[]
  addresses: string[]
  birthday: string | null
  gender: string | null
  image: string | null
  role: string
  provider: string
  createdAt: string
}

export default function AccountPage() {
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (status === 'unauthenticated') { toast.error('Please log in to view your account.'); router.push('/login') } }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    const fetchUser = async () => {
      setIsLoading(true); setError(null)
      try {
        const res = await fetch('/api/account')
        const data = await res.json()
        if (res.ok) setUser(data.user)
        else { setError(data.error || 'Failed to load account details.'); toast.error(data.error || 'Could not load your account information.') }
      } catch { setError('Failed to connect to the server.'); toast.error('Connection error. Please check your internet and try again.') }
      finally { setIsLoading(false) }
    }
    fetchUser()
  }, [status])

  const handleImageUpdate = async (newUrl: string | null) => {
    if (user) { setUser({ ...user, image: newUrl }); await updateSession({ user: { ...session?.user, image: newUrl } }) }
  }
  const handleUserUpdate = (u: UserProfile) => {
    setUser(u)
    if (u.name !== session?.user?.name) updateSession({ user: { ...session?.user, name: u.name } })
  }
  const handleSignOut = async () => { toast.info('Signing you out...'); await signOut({ callbackUrl: '/' }) }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-brand-red" />
        <p className="text-gray-400 text-sm">Loading your account...</p>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Something went wrong</h2>
        <p className="text-gray-400 text-center text-sm max-w-md">{error}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2 bg-brand-red text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
          Try Again
        </button>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className={`min-h-screen bg-[#fafafa] transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Banner */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Subtle red accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-red to-transparent" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0z\' fill=\'none\' stroke=\'white\' stroke-width=\'.5\'/%3E%3C/svg%3E")' }} />

        <div className="relative max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-20 md:pb-24">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm font-medium transition-colors mb-6">
            <ArrowLeft size={15} /> Back to Home
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white">My Account</h1>
          <p className="text-white/40 mt-1.5 text-sm">Manage your profile and preferences</p>
        </div>
      </div>

      {/* Content Card */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-12 md:-mt-14 pb-16">
        <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
          {/* Profile section */}
          <div className="px-6 md:px-10 pt-8 pb-6 flex flex-col md:flex-row items-center gap-6 border-b border-gray-100">
            <ProfileImageUpload currentImage={user.image} userName={user.name} provider={user.provider} onImageUpdate={handleImageUpdate} />

            <div className="text-center md:text-left flex-1">
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-400 text-sm mt-0.5">{user.email}</p>

              <div className="flex items-center gap-2 mt-3 justify-center md:justify-start flex-wrap">
                {user.role === 'admin' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-red bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                    🛡️ Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                    👤 Customer
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                  {(user.provider === 'google' || user.provider === 'both') ? (
                    <svg width="10" height="10" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  ) : '✉️'}
                  {user.provider === 'google' ? 'Google' : user.provider === 'both' ? 'Email & Google' : 'Email & Password'}
                </span>
              </div>
            </div>

            {/* Desktop sign out */}
            <div className="hidden md:block">
              <button onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-gray-500 border border-gray-200 rounded-xl hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="px-6 md:px-10 py-8 md:py-10">
            <AccountDetailsForm user={user} onUserUpdate={handleUserUpdate} />
          </div>

          {/* Mobile sign out */}
          <div className="md:hidden px-6 pb-8">
            <button onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}