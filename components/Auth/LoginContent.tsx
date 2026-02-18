// components/Auth/LoginContent.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (status === 'authenticated' && session) {
      toast.success(`Welcome back, ${session.user.name}!`)
      router.push('/')
    }
  }, [session, status, router])

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      const messages: Record<string, string> = {
        CredentialsSignin: 'Invalid email or password. Please try again.',
        OAuthAccountNotLinked: 'This email is already registered with a different method.',
        AccessDenied: 'Access denied. Please check your credentials.',
      }
      toast.error(messages[error] || 'An error occurred during sign in. Please try again.')
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email.trim()) { toast.error('Please enter your email address.'); return }
    if (!formData.password) { toast.error('Please enter your password.'); return }
    setIsLoading(true)
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      })
      if (result?.error) toast.error(result.error)
      else if (result?.ok) { toast.success('Logged in successfully! Welcome back.'); router.push('/'); router.refresh() }
    } catch { toast.error('Something went wrong. Please try again.') }
    finally { setIsLoading(false) }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try { await signIn('google', { callbackUrl: '/' }) }
    catch { toast.error('Failed to sign in with Google. Please try again.'); setIsGoogleLoading(false) }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      </div>
    )
  }
  if (status === 'authenticated') return null

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center px-4 py-12 md:py-16 relative overflow-hidden bg-[#fafafa]">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-48 w-[500px] h-[500px] bg-brand-red/[0.04] rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-brand-red/[0.03] rounded-full blur-3xl" />
      </div>

      <div className={`w-full max-w-[420px] relative z-10 transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-brand-red/60 via-brand-red to-brand-red/60" />

          {/* Header */}
          <div className="px-8 pt-9 pb-2 text-center">
            <Link href="/" className="inline-block mb-6">
              <Image src="/images/01.webp" alt="LaptopOffers.lk" width={150} height={34} className="mx-auto" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-400 text-[13px] mt-1">Sign in to your account</p>
          </div>

          {/* Body */}
          <div className="px-8 pt-6 pb-9">
            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50/50 active:scale-[0.995] transition-all text-[13px] font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-[11px] text-gray-300 font-medium uppercase tracking-widest">or</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCredentialLogin} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-red transition-colors duration-200" />
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="you@example.com" autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-red transition-colors duration-200" />
                  <input
                    type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                    placeholder="Enter your password" autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-[12px] text-brand-red hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-red hover:bg-red-700 active:scale-[0.995] text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-red-200/50 mt-1">
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={15} strokeWidth={2.5} /></>}
              </button>
            </form>

            <p className="mt-6 text-center text-[13px] text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-brand-red hover:underline font-semibold">Create account</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-300 mt-5">Admin accounts must sign in using Google</p>
      </div>
    </div>
  )
}