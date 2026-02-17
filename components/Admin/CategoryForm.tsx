// components/Admin/CategoryForm.tsx

'use client'

import React, { useState, useRef } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface CategoryFormProps {
  initialData?: {
    id: string
    categoryName: string
    categoryDescription: string
    categoryImage: string
  }
  onSubmit: (data: {
    categoryName: string
    categoryDescription: string
    categoryImage: string
  }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function CategoryForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: CategoryFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    categoryName: initialData?.categoryName || '',
    categoryDescription: initialData?.categoryDescription || '',
    categoryImage: initialData?.categoryImage || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.categoryImage || null
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
      formDataUpload.append('folder', 'category-images')

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formDataUpload,
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Image uploaded successfully!')
        setFormData((prev) => ({
          ...prev,
          categoryImage: data.imageUrl,
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
    setFormData((prev) => ({ ...prev, categoryImage: '' }))
    setPreviewUrl(null)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.categoryName.trim()) {
      newErrors.categoryName = 'Category name is required'
    } else if (formData.categoryName.trim().length < 2) {
      newErrors.categoryName = 'Category name must be at least 2 characters'
    } else if (formData.categoryName.trim().length > 100) {
      newErrors.categoryName = 'Category name cannot exceed 100 characters'
    }

    if (!formData.categoryDescription.trim()) {
      newErrors.categoryDescription = 'Category description is required'
    } else if (formData.categoryDescription.trim().length < 10) {
      newErrors.categoryDescription =
        'Category description must be at least 10 characters'
    } else if (formData.categoryDescription.trim().length > 500) {
      newErrors.categoryDescription =
        'Category description cannot exceed 500 characters'
    }

    if (!formData.categoryImage.trim()) {
      newErrors.categoryImage = 'Category image is required'
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
        categoryName: formData.categoryName.trim(),
        categoryDescription: formData.categoryDescription.trim(),
        categoryImage: formData.categoryImage.trim(),
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
      {/* Category Name */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
          Category Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="categoryName"
          value={formData.categoryName}
          onChange={handleChange}
          placeholder="e.g., Gaming Laptops, Ultrabooks, Budget Laptops"
          className={inputCls(!!errors.categoryName)}
        />
        {errors.categoryName && (
          <p className="text-red-400 text-[12px] mt-2">{errors.categoryName}</p>
        )}
      </div>

      {/* Category Description */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
          Category Description <span className="text-red-400">*</span>
        </label>
        <textarea
          name="categoryDescription"
          value={formData.categoryDescription}
          onChange={handleChange}
          placeholder="Describe the category..."
          rows={5}
          className={`${inputCls(!!errors.categoryDescription)} resize-none`}
        />
        {errors.categoryDescription && (
          <p className="text-red-400 text-[12px] mt-2">
            {errors.categoryDescription}
          </p>
        )}
        <p className="text-gray-400 text-[12px] mt-2">
          {formData.categoryDescription.length}/500 characters
        </p>
      </div>

      {/* Category Image */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
          Category Image <span className="text-red-400">*</span>
        </label>
        <div className="space-y-5">
          {/* Image Preview */}
          {(previewUrl || formData.categoryImage) && (
            <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={previewUrl || formData.categoryImage}
                alt="Category preview"
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

          {errors.categoryImage && (
            <p className="text-red-400 text-[12px]">{errors.categoryImage}</p>
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
            'Update Category'
          ) : (
            'Create Category'
          )}
        </button>
      </div>
    </form>
  )
}