// app/register/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Calendar, ArrowRight, Loader2, Plus, X, Check, ChevronDown } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    contactNumbers: [''], addresses: [''], birthday: '', gender: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)
  const [showOptional, setShowOptional] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (status === 'authenticated' && session) router.push('/') }, [session, status, router])

  const getPasswordStrength = (p: string) => {
    let s = 0; if (p.length >= 8) s++; if (/[A-Z]/.test(p)) s++; if (/[a-z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++; return s
  }
  const passwordStrength = getPasswordStrength(formData.password)
  const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
  const strengthColors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-500']

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
  }
  const handleContactChange = (i: number, v: string) => { const u = [...formData.contactNumbers]; u[i] = v; setFormData((p) => ({ ...p, contactNumbers: u })); if (errors.contactNumbers) setErrors((p) => ({ ...p, contactNumbers: '' })) }
  const addContactNumber = () => { if (formData.contactNumbers.length < 3) setFormData((p) => ({ ...p, contactNumbers: [...p.contactNumbers, ''] })) }
  const removeContactNumber = (i: number) => { if (formData.contactNumbers.length > 1) setFormData((p) => ({ ...p, contactNumbers: p.contactNumbers.filter((_, idx) => idx !== i) })) }
  const handleAddressChange = (i: number, v: string) => { const u = [...formData.addresses]; u[i] = v; setFormData((p) => ({ ...p, addresses: u })) }
  const addAddress = () => { if (formData.addresses.length < 3) setFormData((p) => ({ ...p, addresses: [...p.addresses, ''] })) }
  const removeAddress = (i: number) => { setFormData((p) => ({ ...p, addresses: p.addresses.filter((_, idx) => idx !== i) })) }

  const validateForm = (): boolean => {
    const e: Record<string, string> = {}
    if (!formData.name.trim()) e.name = 'Name is required'
    else if (formData.name.trim().length < 2) e.name = 'At least 2 characters'
    if (!formData.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email'
    if (!formData.password) e.password = 'Password is required'
    else if (formData.password.length < 8) e.password = 'At least 8 characters'
    else if (!/[A-Z]/.test(formData.password)) e.password = 'Needs uppercase'
    else if (!/[a-z]/.test(formData.password)) e.password = 'Needs lowercase'
    else if (!/[0-9]/.test(formData.password)) e.password = 'Needs a number'
    if (!formData.confirmPassword) e.confirmPassword = 'Confirm password'
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords don\'t match'
    const valid = formData.contactNumbers.filter((c) => c.trim())
    if (valid.length === 0) e.contactNumbers = 'At least one number required'
    else { const rx = /^(\+?94|0)?[0-9]{9,10}$/; for (const ph of valid) { if (!rx.test(ph.replace(/[\s-]/g, ''))) { e.contactNumbers = `Invalid: ${ph}`; break } } }
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validateForm()) { toast.error('Please fix the errors below.'); return }
    setIsLoading(true)
    try {
      const payload = {
        name: formData.name.trim(), email: formData.email.trim().toLowerCase(),
        password: formData.password, confirmPassword: formData.confirmPassword,
        contactNumbers: formData.contactNumbers.filter((c) => c.trim()),
        addresses: formData.addresses.filter((a) => a.trim()),
        birthday: formData.birthday || null, gender: formData.gender || null,
      }
      const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (res.ok) {
        toast.success('Account created successfully! Signing you in...')
        const login = await signIn('credentials', { redirect: false, email: payload.email, password: payload.password })
        if (login?.ok) { toast.success('Welcome to LaptopOffers.lk!'); router.push('/'); router.refresh() }
        else { toast.info('Account created! Please log in.'); router.push('/login') }
      } else { toast.error(data.error || 'Registration failed.') }
    } catch { toast.error('Something went wrong.') }
    finally { setIsLoading(false) }
  }

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true)
    try { await signIn('google', { callbackUrl: '/' }) }
    catch { toast.error('Failed to sign in with Google.'); setIsGoogleLoading(false) }
  }

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center bg-[#fafafa]"><Loader2 className="w-8 h-8 animate-spin text-brand-red" /></div>
  if (status === 'authenticated') return null

  const inputCls = (field: string) => `w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all ${errors[field] ? 'border-red-300' : 'border-gray-200'}`

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 md:py-14 relative overflow-hidden bg-[#fafafa]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-48 w-[500px] h-[500px] bg-brand-red/[0.04] rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-brand-red/[0.03] rounded-full blur-3xl" />
      </div>

      <div className={`w-full max-w-[520px] relative z-10 transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-brand-red/60 via-brand-red to-brand-red/60" />

          {/* Header */}
          <div className="px-8 pt-9 pb-2 text-center">
            <Link href="/" className="inline-block mb-5">
              <Image src="/images/01.webp" alt="LaptopOffers.lk" width={150} height={34} className="mx-auto" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-400 text-[13px] mt-1">Join us for the best laptop deals in Sri Lanka</p>
          </div>

          {/* Body */}
          <div className="px-6 md:px-8 pt-6 pb-9">
            {/* Google */}
            <button onClick={handleGoogleRegister} disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50/50 active:scale-[0.995] transition-all text-[13px] font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {isGoogleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              {isGoogleLoading ? 'Connecting...' : 'Sign up with Google'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-4 text-[11px] text-gray-300 font-medium uppercase tracking-widest">or</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-red transition-colors duration-200" />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className={inputCls('name')} />
                  </div>
                  {errors.name && <p className="text-red-400 text-[11px] mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Email <span className="text-red-400">*</span></label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-red transition-colors duration-200" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" className={inputCls('email')} />
                  </div>
                  {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Password <span className="text-red-400">*</span></label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-red transition-colors duration-200" />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Min 8 characters" autoComplete="new-password" className={`${inputCls('password')} !pr-10`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"><Eye size={15} className={showPassword ? 'hidden' : ''} /><EyeOff size={15} className={showPassword ? '' : 'hidden'} /></button>
                  </div>
                  {errors.password && <p className="text-red-400 text-[11px] mt-1">{errors.password}</p>}
                  {formData.password && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex gap-0.5 flex-1">{[1,2,3,4,5].map((l) => <div key={l} className={`h-[3px] flex-1 rounded-full transition-all ${l <= passwordStrength ? strengthColors[passwordStrength] : 'bg-gray-100'}`} />)}</div>
                      <span className={`text-[10px] font-medium ${passwordStrength >= 4 ? 'text-emerald-500' : 'text-gray-400'}`}>{strengthLabels[passwordStrength]}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Confirm <span className="text-red-400">*</span></label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-red transition-colors duration-200" />
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" autoComplete="new-password"
                      className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all ${errors.confirmPassword ? 'border-red-300' : formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-emerald-300' : 'border-gray-200'}`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"><Eye size={15} className={showConfirmPassword ? 'hidden' : ''} /><EyeOff size={15} className={showConfirmPassword ? '' : 'hidden'} /></button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-[11px] mt-1">{errors.confirmPassword}</p>}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && <p className="text-emerald-500 text-[11px] mt-1 flex items-center gap-1"><Check size={11} /> Match</p>}
                </div>
              </div>

              {/* Contact Numbers */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Contact Number <span className="text-red-400">*</span></label>
                <div className="space-y-2">
                  {formData.contactNumbers.map((num, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="relative flex-1 group">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-red transition-colors duration-200" />
                        <input type="tel" value={num} onChange={(e) => handleContactChange(i, e.target.value)} placeholder={i === 0 ? '0771234567' : 'Additional number'} className={inputCls('contactNumbers')} />
                      </div>
                      {formData.contactNumbers.length > 1 && <button type="button" onClick={() => removeContactNumber(i)} className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"><X size={15} /></button>}
                    </div>
                  ))}
                </div>
                {errors.contactNumbers && <p className="text-red-400 text-[11px] mt-1">{errors.contactNumbers}</p>}
                {formData.contactNumbers.length < 3 && <button type="button" onClick={addContactNumber} className="mt-1.5 flex items-center gap-1 text-[12px] text-brand-red hover:underline font-medium"><Plus size={12} /> Add number</button>}
              </div>

              {/* Optional toggle */}
              <button type="button" onClick={() => setShowOptional(!showOptional)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-[12px] font-medium text-gray-400 hover:text-gray-500 transition-colors">
                {showOptional ? 'Hide' : 'Show'} optional fields
                <ChevronDown size={13} className={`transition-transform duration-300 ${showOptional ? 'rotate-180' : ''}`} />
              </button>

              {/* Optional fields */}
              <div className={`overflow-hidden transition-all duration-400 ease-in-out ${showOptional ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Address <span className="text-gray-300 font-normal text-[11px]">optional</span></label>
                    <div className="space-y-2">
                      {formData.addresses.map((addr, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="relative flex-1 group">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-red transition-colors duration-200" />
                            <input type="text" value={addr} onChange={(e) => handleAddressChange(i, e.target.value)} placeholder="Enter address" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all" />
                          </div>
                          {formData.addresses.length > 1 && <button type="button" onClick={() => removeAddress(i)} className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"><X size={15} /></button>}
                        </div>
                      ))}
                    </div>
                    {formData.addresses.length < 3 && <button type="button" onClick={addAddress} className="mt-1.5 flex items-center gap-1 text-[12px] text-brand-red hover:underline font-medium"><Plus size={12} /> Add address</button>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Birthday <span className="text-gray-300 font-normal text-[11px]">optional</span></label>
                      <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-red transition-colors duration-200" />
                        <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Gender <span className="text-gray-300 font-normal text-[11px]">optional</span></label>
                      <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all appearance-none bg-white">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-red hover:bg-red-700 active:scale-[0.995] text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-red-200/50 mt-2">
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</> : <>Create Account <ArrowRight size={15} strokeWidth={2.5} /></>}
              </button>
            </form>

            <p className="mt-6 text-center text-[13px] text-gray-400">
              Already have an account? <Link href="/login" className="text-brand-red hover:underline font-semibold">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}