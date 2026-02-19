// components/Admin/ComponentForm.tsx

'use client'

import React, { useState } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

interface ComponentFormProps {
  initialData?: {
    id: string
    componentName: string
    filterLabels: string[]
  }
  onSubmit: (data: {
    componentName: string
    filterLabels: string[]
  }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function ComponentForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: ComponentFormProps) {
  const [formData, setFormData] = useState({
    componentName: initialData?.componentName || '',
    filterLabels: initialData?.filterLabels || [''],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, componentName: value }))
    if (errors.componentName) {
      setErrors((prev) => ({ ...prev, componentName: '' }))
    }
  }

  const handleFilterLabelChange = (index: number, value: string) => {
    const newLabels = [...formData.filterLabels]
    newLabels[index] = value
    setFormData((prev) => ({ ...prev, filterLabels: newLabels }))
    if (errors[`filterLabel_${index}`]) {
      setErrors((prev) => ({ ...prev, [`filterLabel_${index}`]: '' }))
    }
  }

  const handleAddFilterLabel = () => {
    setFormData((prev) => ({
      ...prev,
      filterLabels: [...prev.filterLabels, ''],
    }))
  }

  const handleRemoveFilterLabel = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      filterLabels: prev.filterLabels.filter((_, i) => i !== index),
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.componentName.trim()) {
      newErrors.componentName = 'Component name is required'
    } else if (formData.componentName.trim().length < 2) {
      newErrors.componentName = 'Component name must be at least 2 characters'
    } else if (formData.componentName.trim().length > 100) {
      newErrors.componentName = 'Component name cannot exceed 100 characters'
    }

    const validLabels = formData.filterLabels.filter((label) => label.trim())
    if (validLabels.length === 0) {
      newErrors.filterLabels = 'At least one filter label is required'
    }

    validLabels.forEach((label, idx) => {
      if (label.trim().length > 50) {
        newErrors[`filterLabel_length`] = 'Filter labels cannot exceed 50 characters'
      }
    })

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
        componentName: formData.componentName.trim(),
        filterLabels: formData.filterLabels
          .filter((label) => label.trim())
          .map((label) => label.trim()),
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
      {/* Component Name */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
          Component Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.componentName}
          onChange={handleNameChange}
          placeholder="e.g., Solid State Drive (SSD), RAM, CPU Cooler"
          className={inputCls(!!errors.componentName)}
        />
        {errors.componentName && (
          <p className="text-red-400 text-[12px] mt-2">{errors.componentName}</p>
        )}
      </div>

      {/* Filter Labels */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-700 mb-2.5">
          Filter Labels <span className="text-red-400">*</span>
        </label>
        <p className="text-gray-500 text-sm mb-4">
          Define the specifications that will be used to categorize items of this component (e.g., Capacity, Speed, Interface)
        </p>

        <div className="space-y-3">
          {formData.filterLabels.map((label, index) => (
            <div key={index} className="flex gap-3 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  value={label}
                  onChange={(e) => handleFilterLabelChange(index, e.target.value)}
                  placeholder={`Filter label ${index + 1} (e.g., Capacity, Speed)`}
                  className={inputCls(!!errors[`filterLabel_${index}`])}
                />
                {errors[`filterLabel_${index}`] && (
                  <p className="text-red-400 text-[12px] mt-2">
                    {errors[`filterLabel_${index}`]}
                  </p>
                )}
              </div>
              {formData.filterLabels.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveFilterLabel(index)}
                  className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        {errors.filterLabels && (
          <p className="text-red-400 text-[12px] mt-2">{errors.filterLabels}</p>
        )}
        {errors.filterLabel_length && (
          <p className="text-red-400 text-[12px] mt-2">{errors.filterLabel_length}</p>
        )}

        <button
          type="button"
          onClick={handleAddFilterLabel}
          className="mt-4 flex items-center gap-2 px-5 py-3 border-2 border-dashed border-gray-300 rounded-xl text-[14px] font-semibold text-gray-600 hover:border-brand-red hover:bg-red-50 hover:text-gray-800 transition-all"
        >
          <Plus size={18} />
          Add Filter Label
        </button>
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
          disabled={isLoading}
          className="flex-1 py-3 text-[14px] font-semibold text-white bg-brand-red rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {initialData ? 'Updating...' : 'Creating...'}
            </>
          ) : initialData ? (
            'Update Component'
          ) : (
            'Create Component'
          )}
        </button>
      </div>
    </form>
  )
}