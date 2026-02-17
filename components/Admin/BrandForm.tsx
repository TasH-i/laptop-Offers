// components/Admin/BrandForm.tsx (UPDATED - Scaled Up)

'use client'

import React, { useState, useRef } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface BrandFormProps {
  initialData?: {
    id: string
    brandName: string
    brandDescription: string
    brandImage: string
  }
  onSubmit: (data: {
    brandName: string
    brandDescription: string
    brandImage: string
  }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function BrandForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: BrandFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    brandName: initialData?.brandName || '',
    brandDescription: initialData?.brandDescription || '',
    brandImage: initialData?.brandImage || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.brandImage || null
  )

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WebP image.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Maximum size is 5MB.')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to S3
    setIsUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)
      formDataUpload.append('folder', 'brand-images')

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formDataUpload,
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Image uploaded successfully!')
        setFormData((prev) => ({
          ...prev,
          brandImage: data.imageUrl,
        }))
      } else {
        toast.error(data.error || 'Failed to upload image.')
        setPreviewUrl(null)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image. Please try again.')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, brandImage: '' }))
    setPreviewUrl(null)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.brandName.trim()) {
      newErrors.brandName = 'Brand name is required'
    } else if (formData.brandName.trim().length < 2) {
      newErrors.brandName = 'Brand name must be at least 2 characters'
    } else if (formData.brandName.trim().length > 100) {
      newErrors.brandName = 'Brand name cannot exceed 100 characters'
    }

    if (!formData.brandDescription.trim()) {
      newErrors.brandDescription = 'Brand description is required'
    } else if (formData.brandDescription.trim().length < 10) {
      newErrors.brandDescription =
        'Brand description must be at least 10 characters'
    } else if (formData.brandDescription.trim().length > 500) {
      newErrors.brandDescription =
        'Brand description cannot exceed 500 characters'
    }

    if (!formData.brandImage.trim()) {
      newErrors.brandImage = 'Brand image is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors below')
      return
    }

    try {
      await onSubmit({
        brandName: formData.brandName.trim(),
        brandDescription: formData.brandDescription.trim(),
        brandImage: formData.brandImage.trim(),
      })
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const inputCls = (hasError: boolean) =>
    `w-full px-5 py-3 border rounded-xl text-base text-gray-800 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all ${
      hasError ? 'border-red-300' : 'border-gray-200'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Brand Name */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
          Brand Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="brandName"
          value={formData.brandName}
          onChange={handleChange}
          placeholder="e.g., Apple, Dell, HP"
          className={inputCls(!!errors.brandName)}
        />
        {errors.brandName && (
          <p className="text-red-400 text-[12px] mt-2">{errors.brandName}</p>
        )}
      </div>

      {/* Brand Description */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
          Brand Description <span className="text-red-400">*</span>
        </label>
        <textarea
          name="brandDescription"
          value={formData.brandDescription}
          onChange={handleChange}
          placeholder="Describe the brand..."
          rows={5}
          className={`${inputCls(!!errors.brandDescription)} resize-none`}
        />
        {errors.brandDescription && (
          <p className="text-red-400 text-[12px] mt-2">
            {errors.brandDescription}
          </p>
        )}
        <p className="text-gray-400 text-[12px] mt-2">
          {formData.brandDescription.length}/500 characters
        </p>
      </div>

      {/* Brand Image */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
          Brand Image <span className="text-red-400">*</span>
        </label>
        <div className="space-y-5">
          {/* Image Preview */}
          {(previewUrl || formData.brandImage) && (
            <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={previewUrl || formData.brandImage}
                alt="Brand preview"
                fill
                className="object-cover"
                unoptimized={previewUrl?.startsWith('data:') || false}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-3 px-5 py-3 border-2 border-dashed border-gray-300 rounded-xl text-[14px] font-semibold text-gray-600 hover:border-brand-red hover:bg-red-50 hover:text-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload Image
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {errors.brandImage && (
            <p className="text-red-400 text-[12px]">{errors.brandImage}</p>
          )}
          <p className="text-gray-400 text-[12px]">
            JPG, PNG or WebP. Max 5MB.
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-8 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-3 text-[14px] font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || isUploading}
          className="flex-1 py-3 text-[14px] font-semibold text-white bg-brand-red rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {initialData ? 'Updating...' : 'Creating...'}
            </>
          ) : initialData ? (
            'Update Brand'
          ) : (
            'Create Brand'
          )}
        </button>
      </div>
    </form>
  )
}