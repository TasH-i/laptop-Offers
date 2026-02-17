// components/Admin/BrandsList.tsx (UPDATED - Scaled Up)

'use client'

import React, { useState } from 'react'
import { Edit, Trash2, Loader2, AlertCircle } from 'lucide-react'
import Image from 'next/image'

interface Brand {
  _id: string
  brandName: string
  brandDescription: string
  brandImage: string
  isActive: boolean
  createdAt: string
}

interface BrandsListProps {
  brands: Brand[]
  isLoading: boolean
  onEdit: (brand: Brand) => void
  onDelete: (brandId: string) => void
}

export default function BrandsList({
  brands,
  isLoading,
  onEdit,
  onDelete,
}: BrandsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDeleteClick = (brandId: string) => {
    setDeletingId(brandId)
  }

  const handleConfirmDelete = async (brandId: string) => {
    await onDelete(brandId)
    setDeletingId(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand-red mx-auto mb-4" />
          <p className="text-gray-600 text-base font-medium">Loading brands...</p>
        </div>
      </div>
    )
  }

  if (brands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
        <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-700 text-lg font-semibold">No brands yet</p>
        <p className="text-gray-500 text-base mt-2">Create your first brand to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {brands.map((brand) => (
        <div
          key={brand._id}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
        >
          {/* Image Section */}
          <div className="relative w-full h-38 bg-gray-50 overflow-hidden">
            <Image
              src={brand.brandImage}
              alt={brand.brandName}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>

          {/* Content Section */}
          <div className="p-6 flex-1 flex flex-col">
            {/* Brand Name */}
            <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
              {brand.brandName}
            </h3>

            {/* Description */}
            <p className="text-base text-gray-600 line-clamp-2 mb-4 flex-1">
              {brand.brandDescription}
            </p>

            {/* Status Badge */}
            {/* <div className="mb-5">
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-full ${
                  brand.isActive
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    brand.isActive ? 'bg-emerald-600' : 'bg-gray-600'
                  }`}
                />
                {brand.isActive ? 'Active' : 'Inactive'}
              </span>
            </div> */}

            {/* Actions */}
            <div className="flex gap-3 pt-5 border-t border-gray-100">
              <button
                onClick={() => onEdit(brand)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(brand._id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>

            {/* Delete Confirmation */}
            {deletingId === brand._id && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-gray-700 mb-3 font-medium">
                  Are you sure you want to delete this brand?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleConfirmDelete(brand._id)}
                    className="flex-1 py-2 text-sm font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setDeletingId(null)}
                    className="flex-1 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}