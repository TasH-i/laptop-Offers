// components/Admin/ComponentItemForm.tsx

'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Loader2, Upload, X, CheckCircle2, AlertCircle, Plus } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import debounce from 'lodash/debounce'

interface FilterValue {
  filterLabel: string
  filterValue: string
}

interface Specification {
  label: string
  value: string
}

interface ComponentItemFormProps {
  initialData?: any
  components: Array<{ _id: string; componentName: string; filterLabels: string[] }>
  brands: Array<{ _id: string; brandName: string }>
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function ComponentItemForm({
  initialData,
  components,
  brands,
  onSubmit,
  onCancel,
  isLoading = false,
}: ComponentItemFormProps) {
  const mainFileInputRef = useRef<HTMLInputElement>(null)
  const subFileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    itemName: initialData?.itemName || '',
    slug: initialData?.slug || '',
    component: initialData?.component?._id || '',
    filterValues: initialData?.filterValues || [],
    brand: initialData?.brand?._id || '',
    model: initialData?.model || '',
    unitPrice: initialData?.unitPrice || '',
    availability: initialData?.availability || 'InStock',
    description: initialData?.description || '',
    specifications: initialData?.specifications || [],
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

  // Get selected component to show its filter labels
  const selectedComponent = components.find((c) => c._id === formData.component)

  // Validate slug on component mount if in edit mode
  useEffect(() => {
    if (initialData?.slug) {
      setSlugValidation({
        isValid: true,
        isUnique: true,
        message: 'Using current slug',
      })
    }
  }, [initialData?.slug])

  // Debounced slug validation
  const checkSlug = useCallback(
    debounce(async (slugValue: string) => {
      if (!slugValue.trim()) {
        setSlugValidation(null)
        return
      }

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
        const requestBody: any = {
          slug: slugValue,
          entityType: 'accessory', // Reusing accessory check-slug endpoint
        }

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

    // Auto-generate slug from item name if it's empty and we're changing the name (CREATE MODE ONLY)
    if (name === 'itemName' && !initialData) {
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

    // Reset filter values when component changes
    if (name === 'component') {
      setFormData((prev) => ({ ...prev, filterValues: [] }))
    }
  }

  // Handle filter value changes
  const handleFilterValueChange = (index: number, value: string) => {
    const newFilterValues = [...formData.filterValues]
    newFilterValues[index] = {
      ...newFilterValues[index],
      filterValue: value,
    }
    setFormData((prev) => ({ ...prev, filterValues: newFilterValues }))
  }

  // Handle specification changes
  const handleSpecificationChange = (index: number, field: 'label' | 'value', value: string) => {
    const newSpecs = [...formData.specifications]
    newSpecs[index] = {
      ...newSpecs[index],
      [field]: value,
    }
    setFormData((prev) => ({ ...prev, specifications: newSpecs }))
  }

  const handleAddSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { label: '', value: '' }],
    }))
  }

  const handleRemoveSpecification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }))
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

    const reader = new FileReader()
    reader.onload = (event) => {
      setMainPreviewUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    setIsUploadingMain(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)
      formDataUpload.append('folder', 'component-item-images')

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

        const reader = new FileReader()
        reader.onload = (event) => {
          setSubPreviewUrls((prev) => [...prev, event.target?.result as string])
        }
        reader.readAsDataURL(file)

        const formDataUpload = new FormData()
        formDataUpload.append('image', file)
        formDataUpload.append('folder', 'component-item-sub-images')

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

    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required'
    } else if (formData.itemName.trim().length < 2) {
      newErrors.itemName = 'Item name must be at least 2 characters'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!slugValidation?.isValid || !slugValidation?.isUnique) {
      newErrors.slug = 'Please use a valid, unique slug'
    }

    if (!formData.component) {
      newErrors.component = 'Component is required'
    }

    if (formData.filterValues.length === 0 || !formData.filterValues.every((fv: any) => fv.filterValue?.trim())) {
      newErrors.filterValues = 'All filter values must be filled'
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required'
    }

    if (!formData.unitPrice) {
      newErrors.unitPrice = 'Unit price is required'
    } else if (isNaN(Number(formData.unitPrice)) || Number(formData.unitPrice) < 0) {
      newErrors.unitPrice = 'Unit price must be a positive number'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
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
        itemName: formData.itemName.trim(),
        slug: formData.slug.trim().toLowerCase(),
        component: formData.component,
        filterValues: formData.filterValues,
        brand: formData.brand || undefined,
        model: formData.model.trim(),
        unitPrice: Number(formData.unitPrice),
        availability: formData.availability,
        description: formData.description.trim(),
        specifications: formData.specifications.filter((s: any) => s.label?.trim() && s.value?.trim()),
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
    formData.itemName.trim() &&
    formData.slug.trim() &&
    formData.component &&
    formData.filterValues.every((fv: any) => fv.filterValue?.trim()) &&
    formData.model.trim() &&
    formData.unitPrice &&
    formData.description.trim() &&
    formData.mainImage &&
    slugValidation?.isValid &&
    slugValidation?.isUnique

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Item Name */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
          Item Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="itemName"
          value={formData.itemName}
          onChange={handleChange}
          placeholder="e.g., Samsung 970 EVO Plus"
          className={inputCls(!!errors.itemName)}
        />
        {errors.itemName && (
          <p className="text-red-400 text-[12px] mt-2">{errors.itemName}</p>
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
            placeholder="e.g., samsung-970-evo-plus (auto-generated from name)"
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

      {/* Component Selection */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
            Component <span className="text-red-400">*</span>
          </label>
          <select
            name="component"
            value={formData.component}
            onChange={handleChange}
            className={inputCls(!!errors.component)}
          >
            <option value="">Select a component...</option>
            {components.map((comp) => (
              <option key={comp._id} value={comp._id}>
                {comp.componentName}
              </option>
            ))}
          </select>
          {errors.component && (
            <p className="text-red-400 text-[12px] mt-2">{errors.component}</p>
          )}
        </div>

        {/* Brand */}
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
            {brands.map((b) => (
              <option key={b._id} value={b._id}>
                {b.brandName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Values - Dynamic based on selected component */}
      {selectedComponent && selectedComponent.filterLabels.length > 0 && (
        <div className="bg-brand-red/5 border border-brand-red/20 rounded-xl p-6 space-y-4">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900 mb-4">
              {selectedComponent.componentName} Specifications
            </h3>
            <div className="space-y-3">
              {selectedComponent.filterLabels.map((label, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {label} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={
                      formData.filterValues[idx]?.filterValue || ''
                    }
                    onChange={(e) => {
                      const newValues = [...formData.filterValues]
                      if (!newValues[idx]) {
                        newValues[idx] = { filterLabel: label, filterValue: '' }
                      }
                      newValues[idx].filterValue = e.target.value
                      setFormData((prev) => ({ ...prev, filterValues: newValues }))
                    }}
                    placeholder={`e.g., 512GB, 3200MHz`}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10"
                  />
                </div>
              ))}
            </div>
          </div>
          {errors.filterValues && (
            <p className="text-red-400 text-[12px]">{errors.filterValues}</p>
          )}
        </div>
      )}

      {!formData.component && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700 font-medium">
            Select a component to see available filter specifications
          </p>
        </div>
      )}

      {/* Model & Pricing */}
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
            Model <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="e.g., MZ-V7S500BW"
            className={inputCls(!!errors.model)}
          />
          {errors.model && (
            <p className="text-red-400 text-[12px] mt-2">{errors.model}</p>
          )}
        </div>

        <div>
          <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
            Unit Price (LKR) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            name="unitPrice"
            value={formData.unitPrice}
            onChange={handleChange}
            placeholder="e.g., 85000"
            min="0"
            step="0.01"
            className={inputCls(!!errors.unitPrice)}
          />
          {errors.unitPrice && (
            <p className="text-red-400 text-[12px] mt-2">{errors.unitPrice}</p>
          )}
        </div>

        <div>
          <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
            Availability <span className="text-red-400">*</span>
          </label>
          <select
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            className={inputCls(!!errors.availability)}
          >
            <option value="InStock">In Stock</option>
            <option value="OutOfStock">Out of Stock</option>
            <option value="PreOrder">Pre Order</option>
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
          placeholder="Detailed description of the component item..."
          rows={5}
          className={`${inputCls(!!errors.description)} resize-none`}
        />
        {errors.description && (
          <p className="text-red-400 text-[12px] mt-2">{errors.description}</p>
        )}
        <p className="text-gray-400 text-[12px] mt-2">
          {formData.description.length}/2000 characters
        </p>
      </div>

      {/* Specifications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-[15px] font-semibold text-gray-700">
            Additional Specifications <span className="text-gray-400">(Optional)</span>
          </label>
          <button
            type="button"
            onClick={handleAddSpecification}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-brand-red hover:bg-red-50 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add Spec
          </button>
        </div>

        <div className="space-y-3">
          {formData.specifications.map((spec, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-3 items-end">
              <input
                type="text"
                value={spec.label}
                onChange={(e) => handleSpecificationChange(idx, 'label', e.target.value)}
                placeholder="e.g., Interface"
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10"
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => handleSpecificationChange(idx, 'value', e.target.value)}
                  placeholder="e.g., NVMe"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpecification(idx)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
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

      {/* Sub Images */}
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

          <p className="text-gray-400 text-[12px]">
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
            'Update Item'
          ) : (
            'Create Item'
          )}
        </button>
      </div>
    </form>
  )
}