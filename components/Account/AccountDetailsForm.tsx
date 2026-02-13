// components/Account/AccountDetailsForm.tsx
'use client'

import React, { useState } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Lock, Plus, X, Loader2, Save, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface UserProfile {
  id: string; name: string; email: string; contactNumbers: string[]; addresses: string[]
  birthday: string | null; gender: string | null; image: string | null; role: string; provider: string; createdAt: string
}

interface AccountDetailsFormProps { user: UserProfile; onUserUpdate: (updated: UserProfile) => void }

export default function AccountDetailsForm({ user, onUserUpdate }: AccountDetailsFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name,
    contactNumbers: user.contactNumbers.length > 0 ? [...user.contactNumbers] : [''],
    addresses: user.addresses.length > 0 ? [...user.addresses] : [''],
    birthday: user.birthday || '',
    gender: user.gender || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: '' }))
  }
  const handleContactChange = (i: number, v: string) => { const u = [...formData.contactNumbers]; u[i] = v; setFormData((p) => ({ ...p, contactNumbers: u })); if (errors.contactNumbers) setErrors((p) => ({ ...p, contactNumbers: '' })) }
  const addContactNumber = () => { if (formData.contactNumbers.length < 3) setFormData((p) => ({ ...p, contactNumbers: [...p.contactNumbers, ''] })) }
  const removeContactNumber = (i: number) => { if (formData.contactNumbers.length > 1) setFormData((p) => ({ ...p, contactNumbers: p.contactNumbers.filter((_, idx) => idx !== i) })) }
  const handleAddressChange = (i: number, v: string) => { const u = [...formData.addresses]; u[i] = v; setFormData((p) => ({ ...p, addresses: u })) }
  const addAddress = () => { if (formData.addresses.length < 3) setFormData((p) => ({ ...p, addresses: [...p.addresses, ''] })) }
  const removeAddress = (i: number) => { setFormData((p) => ({ ...p, addresses: p.addresses.filter((_, idx) => idx !== i) })) }

  const handleCancel = () => {
    setFormData({
      name: user.name,
      contactNumbers: user.contactNumbers.length > 0 ? [...user.contactNumbers] : [''],
      addresses: user.addresses.length > 0 ? [...user.addresses] : [''],
      birthday: user.birthday || '', gender: user.gender || '',
    })
    setErrors({}); setIsEditing(false)
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!formData.name.trim()) e.name = 'Name is required'
    else if (formData.name.trim().length < 2) e.name = 'At least 2 characters'
    const isGoogleAdmin = user.role === 'admin' && user.provider === 'google'
    if (!isGoogleAdmin) {
      const valid = formData.contactNumbers.filter((c) => c.trim())
      if (valid.length === 0) e.contactNumbers = 'At least one number required'
      else { const rx = /^(\+?94|0)?[0-9]{9,10}$/; for (const ph of valid) { if (!rx.test(ph.replace(/[\s-]/g, ''))) { e.contactNumbers = `Invalid: ${ph}`; break } } }
    }
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) { toast.error('Please fix the errors before saving.'); return }
    setIsSaving(true)
    try {
      const res = await fetch('/api/account', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(), contactNumbers: formData.contactNumbers.filter((c) => c.trim()),
          addresses: formData.addresses.filter((a) => a.trim()), birthday: formData.birthday || null, gender: formData.gender || null,
        }),
      })
      const data = await res.json()
      if (res.ok) { toast.success('Your profile has been updated successfully!'); onUserUpdate(data.user); setIsEditing(false) }
      else toast.error(data.error || 'Failed to update profile.')
    } catch { toast.error('Something went wrong. Please try again.') }
    finally { setIsSaving(false) }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const getProviderLabel = () => ({ google: 'Google', credentials: 'Email & Password', both: 'Email & Google' }[user.provider] || user.provider)
  const getGenderLabel = (g: string | null) => !g ? '—' : ({ male: 'Male', female: 'Female', other: 'Other', 'prefer-not-to-say': 'Prefer not to say' }[g] || g)

  const inputCls = (hasError: boolean) => `w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm text-gray-800 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all ${hasError ? 'border-red-300' : 'border-gray-200'}`

  // ── VIEW MODE ──
  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
          <button onClick={() => setIsEditing(true)}
            className="px-4 py-1.5 text-[13px] font-semibold text-brand-red border border-brand-red rounded-xl hover:bg-red-50 transition-colors">
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name */}
          <div className="bg-gray-50/70 rounded-xl px-4 py-3.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <User size={11} /> Full Name
            </label>
            <p className="text-gray-900 font-medium text-[14px]">{user.name}</p>
          </div>

          {/* Email */}
          <div className="bg-gray-50/70 rounded-xl px-4 py-3.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Mail size={11} /> Email <Lock size={9} className="text-gray-300 ml-0.5" />
            </label>
            <p className="text-gray-900 font-medium text-[14px]">{user.email}</p>
          </div>

          {/* Contact */}
          <div className="bg-gray-50/70 rounded-xl px-4 py-3.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Phone size={11} /> Contact Numbers
            </label>
            {user.contactNumbers.length > 0 ? (
              <div className="space-y-0.5">{user.contactNumbers.map((num, i) => <p key={i} className="text-gray-900 font-medium text-[14px]">{num}</p>)}</div>
            ) : <p className="text-gray-400 italic text-sm">Not provided</p>}
          </div>

          {/* Gender */}
          <div className="bg-gray-50/70 rounded-xl px-4 py-3.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Gender</label>
            <p className="text-gray-900 font-medium text-[14px]">{getGenderLabel(user.gender)}</p>
          </div>

          {/* Birthday */}
          <div className="bg-gray-50/70 rounded-xl px-4 py-3.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Calendar size={11} /> Birthday
            </label>
            <p className="text-gray-900 font-medium text-[14px]">{user.birthday ? formatDate(user.birthday) : '—'}</p>
          </div>

          {/* Provider */}
          <div className="bg-gray-50/70 rounded-xl px-4 py-3.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Shield size={11} /> Login Method
            </label>
            <div className="flex items-center gap-2">
              <p className="text-gray-900 font-medium text-[14px]">{getProviderLabel()}</p>
              {user.role === 'admin' && <span className="text-[9px] font-bold text-brand-red bg-red-50 px-1.5 py-0.5 rounded uppercase">Admin</span>}
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="pt-2">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <MapPin size={11} /> Addresses
          </label>
          {user.addresses.length > 0 ? (
            <div className="space-y-2">{user.addresses.map((addr, i) => <div key={i} className="bg-gray-50/70 rounded-xl px-4 py-3 text-gray-800 text-sm">{addr}</div>)}</div>
          ) : <p className="text-gray-400 italic text-sm">No addresses added</p>}
        </div>

        <div className="pt-3 border-t border-gray-50">
          <p className="text-[11px] text-gray-300">Member since {formatDate(user.createdAt)}</p>
        </div>
      </div>
    )
  }

  // ── EDIT MODE ──
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
        <div className="hidden md:flex gap-2">
          <button onClick={handleCancel} disabled={isSaving}
            className="px-4 py-1.5 text-[13px] font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving}
            className="px-4 py-1.5 text-[13px] font-semibold text-white bg-brand-red rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1.5">
            {isSaving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><Save size={13} /> Save Changes</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Full Name <span className="text-red-400">*</span></label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-red transition-colors duration-200" />
            <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputCls(!!errors.name)} />
          </div>
          {errors.name && <p className="text-red-400 text-[11px] mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">Email <Lock size={11} className="text-gray-300" /></label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input type="email" value={user.email} disabled className="w-full pl-10 pr-4 py-2.5 border border-gray-100 rounded-xl text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
          </div>
          <p className="text-[11px] text-gray-300 mt-1">Cannot be changed</p>
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Gender <span className="text-gray-300 text-[11px] font-normal">optional</span></label>
          <select name="gender" value={formData.gender} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all appearance-none bg-white">
            <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Birthday <span className="text-gray-300 text-[11px] font-normal">optional</span></label>
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-red transition-colors duration-200" />
            <input type="date" name="birthday" value={formData.birthday} onChange={handleChange}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all" />
          </div>
        </div>
      </div>

      {/* Contact Numbers */}
      <div>
        <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Contact Numbers <span className="text-red-400">*</span></label>
        <div className="space-y-2">
          {formData.contactNumbers.map((num, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="relative flex-1 group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-red transition-colors duration-200" />
                <input type="tel" value={num} onChange={(e) => handleContactChange(i, e.target.value)} placeholder={i === 0 ? '0771234567' : 'Additional number'} className={inputCls(!!errors.contactNumbers)} />
              </div>
              {formData.contactNumbers.length > 1 && <button type="button" onClick={() => removeContactNumber(i)} className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"><X size={15} /></button>}
            </div>
          ))}
        </div>
        {errors.contactNumbers && <p className="text-red-400 text-[11px] mt-1">{errors.contactNumbers}</p>}
        {formData.contactNumbers.length < 3 && <button type="button" onClick={addContactNumber} className="mt-1.5 flex items-center gap-1 text-[12px] text-brand-red hover:underline font-medium"><Plus size={12} /> Add number</button>}
      </div>

      {/* Addresses */}
      <div>
        <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Addresses <span className="text-gray-300 text-[11px] font-normal">optional</span></label>
        <div className="space-y-2">
          {formData.addresses.map((addr, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="relative flex-1 group">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-red transition-colors duration-200" />
                <input type="text" value={addr} onChange={(e) => handleAddressChange(i, e.target.value)} placeholder="Enter address"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all" />
              </div>
              <button type="button" onClick={() => removeAddress(i)} className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"><X size={15} /></button>
            </div>
          ))}
        </div>
        {formData.addresses.length < 3 && <button type="button" onClick={addAddress} className="mt-1.5 flex items-center gap-1 text-[12px] text-brand-red hover:underline font-medium"><Plus size={12} /> Add address</button>}
      </div>

      {/* Mobile save bar */}
      <div className="md:hidden pt-4 border-t border-gray-100 flex gap-2.5">
        <button onClick={handleCancel} disabled={isSaving}
          className="flex-1 py-2.5 text-[13px] font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
          Cancel
        </button>
        <button onClick={handleSave} disabled={isSaving}
          className="flex-1 py-2.5 text-[13px] font-semibold text-white bg-brand-red rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
          {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}