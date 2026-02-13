// components/Account/ProfileImageUpload.tsx
'use client'

import React, { useRef, useState } from 'react'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface ProfileImageUploadProps {
  currentImage: string | null
  userName: string
  provider: string
  onImageUpdate: (newUrl: string | null) => void
}

export default function ProfileImageUpload({ currentImage, userName, provider, onImageUpdate }: ProfileImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const displayImage = previewUrl || currentImage
  const initials = userName ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'
  const isGoogleImage = currentImage && (currentImage.includes('googleusercontent.com') || currentImage.includes('lh3.google'))

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) { toast.error('Please upload a JPG, PNG, or WebP image.'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image is too large. Maximum size is 5MB.'); return }

    const reader = new FileReader()
    reader.onload = (event) => setPreviewUrl(event.target?.result as string)
    reader.readAsDataURL(file)

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const response = await fetch('/api/upload-profile-image', { method: 'POST', body: formData })
      const data = await response.json()
      if (response.ok) { toast.success('Profile photo updated successfully!'); onImageUpdate(data.imageUrl); setPreviewUrl(null) }
      else { toast.error(data.error || 'Failed to upload image.'); setPreviewUrl(null) }
    } catch { toast.error('Upload failed. Please check your connection and try again.'); setPreviewUrl(null) }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const handleRemoveImage = async () => {
    if (!currentImage) return
    setIsRemoving(true)
    try {
      const response = await fetch('/api/upload-profile-image', { method: 'DELETE' })
      const data = await response.json()
      if (response.ok) { toast.success('Profile photo removed.'); onImageUpdate(data.imageUrl); setPreviewUrl(null) }
      else toast.error(data.error || 'Failed to remove image.')
    } catch { toast.error('Failed to remove image. Please try again.') }
    finally { setIsRemoving(false) }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm bg-gray-50">
          {displayImage ? (
            <Image src={displayImage} alt={userName || 'Profile'} width={112} height={112} className="w-full h-full object-cover" unoptimized={displayImage.startsWith('data:')} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <span className="text-white font-bold text-2xl md:text-3xl tracking-tight">{initials}</span>
            </div>
          )}

          {isUploading ? (
            <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all duration-300 cursor-pointer">
              <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          )}
        </div>

        <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
          className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-brand-red hover:bg-red-700 rounded-lg flex items-center justify-center shadow-md transition-colors disabled:opacity-50">
          <Camera className="w-3.5 h-3.5 text-white" />
        </button>

        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} className="hidden" />
      </div>

      <div className="text-center">
        <p className="text-[11px] text-gray-300">JPG, PNG or WebP. Max 5MB.</p>

        {isGoogleImage && !previewUrl && (
          <p className="text-[11px] text-blue-400 mt-0.5 flex items-center justify-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google photo
          </p>
        )}

        {displayImage && !isGoogleImage && (
          <button onClick={handleRemoveImage} disabled={isRemoving}
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50">
            {isRemoving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            Remove
          </button>
        )}
      </div>
    </div>
  )
}