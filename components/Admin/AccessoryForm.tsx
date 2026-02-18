// components/Admin/AccessoryForm.tsx (PROPERLY FIXED - Slug validation works in edit mode)

'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Loader2, Upload, X, CheckCircle2, AlertCircle, Plus } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import debounce from 'lodash/debounce'

interface AccessoryFormProps {
  initialData?: {
    id: string
    accessoryName: string
    slug: string
    brand?: string
    category?: string
    description: string
    offerPrice: number
    oldPrice?: number
    mainImage: string
    subImages: string[]
    isNewArrival: boolean
  }
  brands: Array<{ _id: string; brandName: string }>
  categories: Array<{ _id: string; categoryName: string }>
  onSubmit: (data: {
    accessoryName: string
    slug: string
    brand?: string
    category?: string
    description: string
    offerPrice: number
    oldPrice?: number
    mainImage: string
    subImages: string[]
    isNewArrival: boolean
  }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function AccessoryForm({
  initialData,
  brands,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
}: AccessoryFormProps) {
  const mainFileInputRef = useRef<HTMLInputElement>(null)
  const subFileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    accessoryName: initialData?.accessoryName || '',
    slug: initialData?.slug || '',
    brand: initialData?.brand || '',
    category: initialData?.category || '',
    description: initialData?.description || '',
    offerPrice: initialData?.offerPrice || '',
    oldPrice: initialData?.oldPrice || '',
    mainImage: initialData?.mainImage || '',
    subImages: initialData?.subImages || [],
    isNewArrival: initialData?.isNewArrival || false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUploadingMain, setIsUploadingMain] = useState(false)
  const [isUploadingSub, setIsUploadingSub] = useState(false)
  const [mainPreviewUrl, setMainPreviewUrl] = useState<string | null>(
    initialData?.mainImage || null
  )
  const [subPreviewUrls, setSubPreviewUrls] = useState<string[]>(
    initialData?.subImages || []
  )
  const [slugValidation, setSlugValidation] = useState<{
    isValid: boolean
    isUnique: boolean
    message: string
  } | null>(null)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)

  // Validate slug on component mount if in edit mode
  useEffect(() => {
    if (initialData?.slug) {
      // Auto-validate the current slug in edit mode
      setSlugValidation({
        isValid: true,
        isUnique: true,
        message: 'Using current slug',
      })
    }
  }, [initialData?.slug])

  // Debounced slug validation using universal endpoint
  const checkSlug = useCallback(
    debounce(async (slugValue: string) => {
      if (!slugValue.trim()) {
        setSlugValidation(null)
        return
      }

      // If editing and slug hasn't changed from original, auto-validate without API call
      if (initialData && slugValue.toLowerCase() === initialData.slug.toLowerCase()) {
        setSlugValidation({
          isValid: true,
          isUnique: true,
          message: 'Using current slug',
        })
        return
      }

      setIsCheckingSlug(true)
      try {
        // Build request body
        const requestBody: any = {
          slug: slugValue,
          entityType: 'accessory',
        }
        
        // Only include excludeId if we're in edit mode
        if (initialData?.id) {
          requestBody.excludeId = initialData.id
        }

        const response = await fetch('/api/admin/check-slug', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        })

        const data = await response.json()
        setSlugValidation(data)
      } catch (error) {
        console.error('Slug check error:', error)
        setSlugValidation({
          isValid: false,
          isUnique: false,
          message: 'Failed to validate slug',
        })
      } finally {
        setIsCheckingSlug(false)
      }
    }, 500),
    [initialData]
  )

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target
    const finalValue =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

    setFormData((prev) => ({ ...prev, [name]: finalValue }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }

    // Auto-generate slug from accessory name if it's empty and we're changing the name (CREATE MODE ONLY)
    if (name === 'accessoryName' && !initialData) {
      const autoSlug = (value as string)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

      if (autoSlug) {
        setFormData((prev) => ({ ...prev, slug: autoSlug }))
        checkSlug(autoSlug)
      }
    }

    // Validate slug on change
    if (name === 'slug') {
      checkSlug(value as string)
    }
  }

  const handleMainImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      setMainPreviewUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to S3
    setIsUploadingMain(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)
      formDataUpload.append('folder', 'accessory-images')

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formDataUpload,
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Main image uploaded successfully!')
        setFormData((prev) => ({
          ...prev,
          mainImage: data.imageUrl,
        }))
      } else {
        toast.error(data.error || 'Failed to upload main image.')
        setMainPreviewUrl(null)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload main image. Please try again.')
      setMainPreviewUrl(null)
    } finally {
      setIsUploadingMain(false)
      if (mainFileInputRef.current) {
        mainFileInputRef.current.value = ''
      }
    }
  }

  const handleSubImagesSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files
    if (!files) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    setIsUploadingSub(true)
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (!allowedTypes.includes(file.type)) {
          toast.error(`File ${file.name}: Invalid file type. Use JPG, PNG, or WebP.`)
          continue
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name}: Too large. Maximum size is 5MB.`)
          continue
        }

        // Show preview
        const reader = new FileReader()
        reader.onload = (event) => {
          setSubPreviewUrls((prev) => [...prev, event.target?.result as string])
        }
        reader.readAsDataURL(file)

        const formDataUpload = new FormData()
        formDataUpload.append('image', file)
        formDataUpload.append('folder', 'accessory-sub-images')

        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formDataUpload,
        })

        const data = await response.json()

        if (response.ok) {
          uploadedUrls.push(data.imageUrl)
        } else {
          toast.error(`Failed to upload ${file.name}.`)
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          subImages: [...prev.subImages, ...uploadedUrls],
        }))
        toast.success(`${uploadedUrls.length} sub image(s) uploaded successfully!`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload sub images. Please try again.')
    } finally {
      setIsUploadingSub(false)
      if (subFileInputRef.current) {
        subFileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveMainImage = () => {
    setFormData((prev) => ({ ...prev, mainImage: '' }))
    setMainPreviewUrl(null)
  }

  const handleRemoveSubImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      subImages: prev.subImages.filter((_, i) => i !== index),
    }))
    setSubPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.accessoryName.trim()) {
      newErrors.accessoryName = 'Accessory name is required'
    } else if (formData.accessoryName.trim().length < 2) {
      newErrors.accessoryName = 'Accessory name must be at least 2 characters'
    } else if (formData.accessoryName.trim().length > 150) {
      newErrors.accessoryName = 'Accessory name cannot exceed 150 characters'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!slugValidation?.isValid || !slugValidation?.isUnique) {
      newErrors.slug = 'Please use a valid, unique slug'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    } else if (formData.description.trim().length > 1500) {
      newErrors.description = 'Description cannot exceed 1500 characters'
    }

    if (!formData.offerPrice) {
      newErrors.offerPrice = 'Offer price is required'
    } else if (isNaN(Number(formData.offerPrice)) || Number(formData.offerPrice) < 0) {
      newErrors.offerPrice = 'Offer price must be a positive number'
    }

    if (
      formData.oldPrice &&
      (isNaN(Number(formData.oldPrice)) || Number(formData.oldPrice) < 0)
    ) {
      newErrors.oldPrice = 'Old price must be a positive number'
    }

    if (!formData.mainImage.trim()) {
      newErrors.mainImage = 'Main image is required'
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
        accessoryName: formData.accessoryName.trim(),
        slug: formData.slug.trim().toLowerCase(),
        brand: formData.brand || undefined,
        category: formData.category || undefined,
        description: formData.description.trim(),
        offerPrice: Number(formData.offerPrice),
        oldPrice: formData.oldPrice ? Number(formData.oldPrice) : undefined,
        mainImage: formData.mainImage.trim(),
        subImages: formData.subImages.filter((img) => img && img.trim()),
        isNewArrival: formData.isNewArrival,
      })
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const inputCls = (hasError: boolean) =>
    `w-full px-5 py-3 border rounded-xl text-base text-gray-800 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all ${
      hasError ? 'border-red-300' : 'border-gray-200'
    }`

  const isFormValid =
    formData.accessoryName.trim() &&
    formData.slug.trim() &&
    formData.description.trim() &&
    formData.offerPrice &&
    formData.mainImage &&
    slugValidation?.isValid &&
    slugValidation?.isUnique

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Mode indicator */}
      {/* {initialData && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-[13px] text-blue-700 font-medium">
            ✏️ Editing Mode: You can keep the same slug if you don't want to change it
          </p>
        </div>
      )} */}

      {/* Accessory Name */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
          Accessory Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="accessoryName"
          value={formData.accessoryName}
          onChange={handleChange}
          placeholder="e.g., USB-C Docking Station, Laptop Stand, Cooling Pad"
          className={inputCls(!!errors.accessoryName)}
        />
        {errors.accessoryName && (
          <p className="text-red-400 text-[12px] mt-2">{errors.accessoryName}</p>
        )}
      </div>

      {/* Slug with Validation */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
          Slug <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="e.g., usb-c-docking-station (auto-generated from name)"
            className={inputCls(!!errors.slug)}
          />
          {isCheckingSlug && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-brand-red" />
            </div>
          )}
          {!isCheckingSlug && slugValidation && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {slugValidation.isValid && slugValidation.isUnique ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>

        {/* Slug Help Text */}
        <div className="mt-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
          <p className="text-[12px] font-semibold text-gray-700 mb-2">Slug Guidelines:</p>
          <ul className="text-[12px] text-gray-600 space-y-1">
            <li>✓ Lowercase letters and numbers only</li>
            <li>✓ Use hyphens (-) to separate words</li>
            <li>✗ No spaces, underscores, or special characters</li>
          </ul>
        </div>

        {slugValidation && (
          <div
            className={`mt-2 text-[12px] flex items-center gap-1.5 ${
              slugValidation.isValid && slugValidation.isUnique
                ? 'text-emerald-600'
                : 'text-red-400'
            }`}
          >
            {slugValidation.isValid && slugValidation.isUnique ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            {slugValidation.message}
          </div>
        )}

        {errors.slug && (
          <p className="text-red-400 text-[12px] mt-2">{errors.slug}</p>
        )}
      </div>

      {/* Brand & Category */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
            Brand <span className="text-gray-400">(Optional)</span>
          </label>
          <select
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className={inputCls(!!errors.brand)}
          >
            <option value="">Select a brand...</option>
            {brands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.brandName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
            Category <span className="text-gray-400">(Optional)</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={inputCls(!!errors.category)}
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.categoryName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the accessory features, specifications, and benefits..."
          rows={5}
          className={`${inputCls(!!errors.description)} resize-none`}
        />
        {errors.description && (
          <p className="text-red-400 text-[12px] mt-2">{errors.description}</p>
        )}
        <p className="text-gray-400 text-[12px] mt-2">
          {formData.description.length}/1500 characters
        </p>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
            Offer Price (LKR) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            name="offerPrice"
            value={formData.offerPrice}
            onChange={handleChange}
            placeholder="e.g., 4,999"
            min="0"
            step="0.01"
            className={inputCls(!!errors.offerPrice)}
          />
          {errors.offerPrice && (
            <p className="text-red-400 text-[12px] mt-2">{errors.offerPrice}</p>
          )}
        </div>

        <div>
          <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
            Old Price (LKR) <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="number"
            name="oldPrice"
            value={formData.oldPrice}
            onChange={handleChange}
            placeholder="e.g., 6,999"
            min="0"
            step="0.01"
            className={inputCls(!!errors.oldPrice)}
          />
          {errors.oldPrice && (
            <p className="text-red-400 text-[12px] mt-2">{errors.oldPrice}</p>
          )}
        </div>
      </div>

      {/* Main Image */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
          Main Image <span className="text-red-400">*</span>
        </label>
        <div className="space-y-5">
          {(mainPreviewUrl || formData.mainImage) && (
            <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={mainPreviewUrl || formData.mainImage}
                alt="Main preview"
                fill
                className="object-cover"
                unoptimized={mainPreviewUrl?.startsWith('data:') || false}
              />
              <button
                type="button"
                onClick={handleRemoveMainImage}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => mainFileInputRef.current?.click()}
            disabled={isUploadingMain}
            className="flex items-center gap-3 px-5 py-3 border-2 border-dashed border-gray-300 rounded-xl text-[14px] font-semibold text-gray-600 hover:border-brand-red hover:bg-red-50 hover:text-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploadingMain ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload Main Image
              </>
            )}
          </button>

          <input
            ref={mainFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleMainImageSelect}
            className="hidden"
          />

          {errors.mainImage && (
            <p className="text-red-400 text-[12px]">{errors.mainImage}</p>
          )}
          <p className="text-gray-400 text-[12px]">JPG, PNG or WebP. Max 5MB.</p>
        </div>
      </div>

      {/* Sub Images - Unlimited with 4 Column Grid */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
          Sub Images <span className="text-gray-400">(Optional)</span>
        </label>
        <div className="space-y-5">
          {subPreviewUrls.length > 0 && (
            <div className="grid grid-cols-5 gap-4">
              {subPreviewUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group"
                >
                  <Image
                    src={url}
                    alt={`Sub image ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized={url.startsWith('data:') || false}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubImage(index)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => subFileInputRef.current?.click()}
            disabled={isUploadingSub}
            className="flex items-center gap-3 px-5 py-3 border-2 border-dashed border-gray-300 rounded-xl text-[14px] font-semibold text-gray-600 hover:border-brand-red hover:bg-red-50 hover:text-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
          >
            {isUploadingSub ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Plus size={18} />
                Add Sub Images
              </>
            )}
          </button>

          <input
            ref={subFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleSubImagesSelect}
            multiple
            className="hidden"
          />

          <p className="text-gray-400 font-medium text-[15px]">
            JPG, PNG or WebP. Max 5MB each. {subPreviewUrls.length} image{subPreviewUrls.length !== 1 ? 's' : ''} uploaded.
          </p>
        </div>
      </div>

      {/* New Arrival Checkbox */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isNewArrival"
            checked={formData.isNewArrival}
            onChange={handleChange}
            className="w-5 h-5 rounded border-gray-300 text-brand-red focus:ring-2 focus:ring-brand-red/20 cursor-pointer"
          />
          <span className="text-[15px] font-semibold text-gray-700">
            Mark as New Arrival
          </span>
        </label>
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
          disabled={isLoading || !isFormValid}
          className="flex-1 py-3 text-[14px] font-semibold text-white bg-brand-red rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {initialData ? 'Updating...' : 'Creating...'}
            </>
          ) : initialData ? (
            'Update Accessory'
          ) : (
            'Create Accessory'
          )}
        </button>
      </div>
    </form>
  )
}