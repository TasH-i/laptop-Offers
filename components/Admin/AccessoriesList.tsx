// components/Admin/AccessoriesList.tsx (Final Professional - Eye Button Opens Details)

'use client'

import React, { useState } from 'react'
import { Edit, Trash2, Loader2, AlertCircle, Star, ChevronUp, ChevronDown, Eye, X } from 'lucide-react'
import Image from 'next/image'

interface Accessory {
  _id: string
  accessoryName: string
  slug: string
  brand?: { _id: string; brandName: string }
  category?: { _id: string; categoryName: string }
  description: string
  offerPrice: number
  oldPrice?: number
  mainImage: string
  subImages: string[]
  isNewArrival: boolean
  isActive: boolean
  createdAt: string
}

interface AccessoriesListProps {
  accessories: Accessory[]
  isLoading: boolean
  onEdit: (accessory: Accessory) => void
  onDelete: (accessoryId: string) => void
}

type SortKey = 'name' | 'price' | 'brand' | 'category' | 'created'
type SortOrder = 'asc' | 'desc'

export default function AccessoriesList({
  accessories,
  isLoading,
  onEdit,
  onDelete,
}: AccessoriesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewingAccessory, setViewingAccessory] = useState<Accessory | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('created')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const sortedAccessories = [...accessories].sort((a, b) => {
    let aValue: any = ''
    let bValue: any = ''

    switch (sortKey) {
      case 'name':
        aValue = a.accessoryName.toLowerCase()
        bValue = b.accessoryName.toLowerCase()
        break
      case 'price':
        aValue = a.offerPrice
        bValue = b.offerPrice
        break
      case 'brand':
        aValue = (a.brand?.brandName || '').toLowerCase()
        bValue = (b.brand?.brandName || '').toLowerCase()
        break
      case 'category':
        aValue = (a.category?.categoryName || '').toLowerCase()
        bValue = (b.category?.categoryName || '').toLowerCase()
        break
      case 'created':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const handleDeleteClick = (accessoryId: string) => {
    setDeletingId(accessoryId)
  }

  const handleConfirmDelete = async (accessoryId: string) => {
    await onDelete(accessoryId)
    setDeletingId(null)
  }

  const calculateDiscount = (offerPrice: number, oldPrice?: number) => {
    if (!oldPrice || oldPrice <= offerPrice) return 0
    return Math.round(((oldPrice - offerPrice) / oldPrice) * 100)
  }

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <div className="w-4 h-4" />
    }
    return sortOrder === 'asc' ? (
      <ChevronUp size={18} className="text-brand-red" />
    ) : (
      <ChevronDown size={18} className="text-brand-red" />
    )
  }

  const TableHeader = ({ label, sortableKey }: { label: string; sortableKey?: SortKey }) => (
    <th
    //   onClick={() => sortableKey && handleSort(sortableKey)}
      className={`px-8 py-5 text-left text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-200 ${
        sortableKey ? 'cursor-notallow ' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        {label}
        {sortableKey && <SortIcon columnKey={sortableKey} />}
      </div>
    </th>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-red mx-auto mb-4" />
          <p className="text-gray-600 text-base font-medium">Loading accessories...</p>
        </div>
      </div>
    )
  }

  if (accessories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-xl border border-gray-200">
        <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-700 text-lg font-semibold">No accessories found</p>
        <p className="text-gray-500 text-base mt-2">Create your first accessory to get started</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <colgroup>
              <col style={{ width: '28%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '28%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>
            <thead>
              <tr>
                <TableHeader label="Product" sortableKey="name" />
                <TableHeader label="Brand" sortableKey="brand" />
                <TableHeader label="Category" sortableKey="category" />
                <TableHeader label="Price" sortableKey="price" />
                <TableHeader label="Images" />
                <TableHeader label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedAccessories.map((accessory) => {
                const discount = calculateDiscount(accessory.offerPrice, accessory.oldPrice)
                const isDeleting = deletingId === accessory._id

                return (
                  <React.Fragment key={accessory._id}>
                    <tr className="hover:bg-blue-50/60 transition-colors duration-200">
                      {/* Product */}
                      <td className="px-8 py-6">
                        <div className="flex items-start gap-4">
                          {/* Image with Badge */}
                          <div className="relative flex-shrink-0">
                            <div className="w-22 h-22 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                              <Image
                                src={accessory.mainImage}
                                alt={accessory.accessoryName}
                                width={92}
                                height={92}
                                className="object-contain w-full h-full"
                              />
                            </div>
                            {accessory.isNewArrival && (
                              <div className="absolute -top-4 -left-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg border-2 border-white">
                                <Star size={12} fill="white" />
                                <span className="text-xs font-bold">New</span>
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-gray-900 truncate">
                              {accessory.accessoryName}
                            </h4>
                            <p className="text-md text-gray-600 truncate mt-1">
                              {accessory.description.substring(0, 50)}...
                            </p>
                            <p className="text-sm text-gray-400 font-mono mt-2 truncate bg-gray-50 px-2.5 py-1 rounded w-fit">
                              {accessory.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="px-8 py-6">
                        {accessory.brand ? (
                          <span className="inline-flex text-sm font-semibold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                            {accessory.brand.brandName}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-lg">—</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-8 py-6">
                        {accessory.category ? (
                          <span className="inline-flex text-sm font-semibold text-violet-700 bg-violet-50 px-4 py-2 rounded-lg border border-violet-200 max-w-xs truncate">
                            {accessory.category.categoryName}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-lg">—</span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <span className="text-base font-bold text-gray-900">
                            LKR {accessory.offerPrice.toLocaleString()}
                          </span>
                          {accessory.oldPrice && discount > 0 && (
                            <div className="flex flex-row gap-4">
                              <span className="text-sm text-gray-400 line-through">
                                LKR {accessory.oldPrice.toLocaleString()}
                              </span>
                              <span className="text-sm font-bold text-emerald-600">
                                Save {discount}%
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Images */}
                      <td className="px-8 py-6">
                        <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                          <span className="text-base font-bold text-gray-700">
                            {1 + accessory.subImages.length}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setViewingAccessory(accessory)}
                            className="text-blue-600 hover:text-blue-700 transition-colors duration-150"
                            title="View accessory details"
                          >
                            <Eye size={20} strokeWidth={2.2} />
                          </button>
                          <button
                            onClick={() => onEdit(accessory)}
                            className="text-gray-700 hover:text-gray-900 transition-colors duration-150"
                            title="Edit accessory"
                          >
                            <Edit size={20} strokeWidth={2.2} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(accessory._id)}
                            className="text-red-600 hover:text-red-700 transition-colors duration-150"
                            title="Delete accessory"
                          >
                            <Trash2 size={20} strokeWidth={2.2} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Delete Confirmation Row */}
                    {isDeleting && (
                      <tr className="bg-red-50 border-t-2 border-red-200">
                        <td colSpan={6} className="px-8 py-6">
                          <div className="flex items-center justify-between gap-6">
                            <div>
                              <p className="text-base font-bold text-red-900">
                                Delete "{accessory.accessoryName}"?
                              </p>
                              <p className="text-sm text-red-700 mt-1.5">
                                This action cannot be undone. All images will be removed.
                              </p>
                            </div>
                            <div className="flex gap-3 flex-shrink-0">
                              <button
                                onClick={() => handleConfirmDelete(accessory._id)}
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-150 whitespace-nowrap"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors duration-150 whitespace-nowrap"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-600">
            Showing <span className="font-bold text-gray-900">{sortedAccessories.length}</span> {sortedAccessories.length === 1 ? 'accessory' : 'accessories'}
          </p>
        </div>
      </div>

      {/* Details Modal */}
      {viewingAccessory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Accessory Details</h2>
              <button
                onClick={() => setViewingAccessory(null)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-8 py-6 space-y-6">
              {/* Product Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Information</h3>
                <div className="flex gap-6">
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                    <Image
                      src={viewingAccessory.mainImage}
                      alt={viewingAccessory.accessoryName}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Product Name</p>
                      <p className="text-base font-semibold text-gray-900">{viewingAccessory.accessoryName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Slug</p>
                      <p className="text-base font-mono text-gray-700">{viewingAccessory.slug}</p>
                    </div>
                    {viewingAccessory.isNewArrival && (
                      <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm font-semibold">New Arrival</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                <p className="text-base text-gray-700 leading-relaxed">{viewingAccessory.description}</p>
              </div>

              {/* Brand & Category */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 font-medium">Brand</p>
                  {viewingAccessory.brand ? (
                    <p className="inline-flex text-sm font-semibold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                      {viewingAccessory.brand.brandName}
                    </p>
                  ) : (
                    <p className="text-gray-500">Not assigned</p>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 font-medium">Category</p>
                  {viewingAccessory.category ? (
                    <p className="inline-flex text-sm font-semibold text-violet-700 bg-violet-50 px-4 py-2 rounded-lg border border-violet-200">
                      {viewingAccessory.category.categoryName}
                    </p>
                  ) : (
                    <p className="text-gray-500">Not assigned</p>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-3 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-base text-gray-700">Offer Price:</p>
                    <p className="text-lg font-bold text-gray-900">LKR {viewingAccessory.offerPrice.toLocaleString()}</p>
                  </div>
                  {viewingAccessory.oldPrice && (
                    <>
                      <div className="flex justify-between items-center">
                        <p className="text-base text-gray-700">Original Price:</p>
                        <p className="text-lg font-semibold text-gray-400 line-through">LKR {viewingAccessory.oldPrice.toLocaleString()}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-base text-gray-700">Discount:</p>
                        <p className="text-lg font-bold text-emerald-600">
                          Save {calculateDiscount(viewingAccessory.offerPrice, viewingAccessory.oldPrice)}%
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Images ({1 + viewingAccessory.subImages.length} total)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Main Image */}
                  <div className="rounded-lg overflow-hidden bg-gray-100 border-2 border-brand-red">
                    <Image
                      src={viewingAccessory.mainImage}
                      alt="Main"
                      width={150}
                      height={150}
                      className="object-cover w-full h-40"
                    />
                    <p className="text-xs font-semibold text-center bg-brand-red text-white py-1">Main</p>
                  </div>
                  {/* Sub Images */}
                  {viewingAccessory.subImages.map((image, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <Image
                        src={image}
                        alt={`Sub ${idx + 1}`}
                        width={150}
                        height={150}
                        className="object-cover w-full h-40"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-8 py-4 bg-gray-50 flex gap-3">
              <button
                onClick={() => setViewingAccessory(null)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onEdit(viewingAccessory)
                  setViewingAccessory(null)
                }}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Edit This Accessory
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}