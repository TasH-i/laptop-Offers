// components/Admin/ComponentItemsList.tsx

'use client'

import React, { useState } from 'react'
import { Edit, Trash2, Loader2, AlertCircle, Star, Eye, X } from 'lucide-react'
import Image from 'next/image'

interface ComponentItem {
  _id: string
  itemName: string
  slug: string
  component: { _id: string; componentName: string; filterLabels: string[] }
  brand?: { _id: string; brandName: string }
  model: string
  unitPrice: number
  availability: 'InStock' | 'OutOfStock' | 'PreOrder'
  mainImage: string
  subImages: string[]
  filterValues: Array<{ filterLabel: string; filterValue: string }>
  specifications: Array<{ label: string; value: string }>
  description: string
  isNewArrival: boolean
  isActive: boolean
  createdAt: string
}

interface ComponentItemsListProps {
  items: ComponentItem[]
  isLoading: boolean
  onEdit: (item: ComponentItem) => void
  onDelete: (itemId: string) => void
}

const availabilityBadges: Record<string, { color: string; textColor: string }> = {
  InStock: { color: 'bg-emerald-50', textColor: 'text-emerald-700' },
  OutOfStock: { color: 'bg-red-50', textColor: 'text-red-700' },
  PreOrder: { color: 'bg-blue-50', textColor: 'text-blue-700' },
}

export default function ComponentItemsList({
  items,
  isLoading,
  onEdit,
  onDelete,
}: ComponentItemsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewingItem, setViewingItem] = useState<ComponentItem | null>(null)

  const handleDeleteClick = (itemId: string) => {
    setDeletingId(itemId)
  }

  const handleConfirmDelete = async (itemId: string) => {
    await onDelete(itemId)
    setDeletingId(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-red mx-auto mb-4" />
          <p className="text-gray-600 text-base font-medium">Loading component items...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-xl border border-gray-200">
        <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-700 text-lg font-semibold">No component items found</p>
        <p className="text-gray-500 text-base mt-2">Create your first component item to get started</p>
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
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '10%' }} />
              {/* <col style={{ width: '8%' }} /> */}
              <col style={{ width: '8%' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-200">Product</th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-200">Component</th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-200">Brand</th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-200">Price (LKR)</th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-200">Availability</th>
                {/* <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-200">View</th> */}
                <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <React.Fragment key={item._id}>
                  <tr className="hover:bg-blue-50/60 transition-colors duration-200">
                    {/* Product */}
                    <td className="px-8 py-6">
                      <div className="flex items-start gap-4">
                        {/* Image with Badge */}
                        <div className="relative flex-shrink-0">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                            <Image
                              src={item.mainImage}
                              alt={item.itemName}
                              width={80}
                              height={80}
                              className="object-contain w-full h-full"
                            />
                          </div>
                          {item.isNewArrival && (
                            <div className="absolute -top-4 -left-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg border-2 border-white">
                              <Star size={12} fill="white" />
                              <span className="text-xs font-bold">New</span>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-semibold text-gray-900 truncate">
                            {item.itemName}
                          </h4>
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {item.model}
                          </p>
                          <p className="text-xs text-gray-400 font-mono mt-2 truncate bg-gray-50 px-2.5 py-1 rounded w-fit">
                            {item.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Component */}
                    <td className="px-8 py-6">
                      <span className="inline-flex text-sm font-semibold text-violet-700 bg-violet-50 px-3 py-1.5 rounded-lg border border-violet-200 max-w-xs truncate">
                        {item.component.componentName}
                      </span>
                    </td>

                    {/* Brand */}
                    <td className="px-8 py-6">
                      {item.brand ? (
                        <span className="inline-flex text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                          {item.brand.brandName}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-lg">—</span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-8 py-6">
                      <span className="text-base font-bold text-gray-900">
                    LRK {item.unitPrice.toLocaleString()}
                      </span>
                    </td>

                    {/* Availability */}
                    <td className="px-8 py-6">
                      <span
                        className={`inline-flex text-sm font-semibold px-3 py-1.5 rounded-lg border ${
                          availabilityBadges[item.availability]?.color
                        } ${availabilityBadges[item.availability]?.textColor}`}
                      >
                        {item.availability === 'InStock' && 'In Stock'}
                        {item.availability === 'OutOfStock' && 'Out of Stock'}
                        {item.availability === 'PreOrder' && 'Pre Order'}
                      </span>
                    </td>

                    {/* View Button */}
                    {/* <td className="px-8 py-6">
                      
                    </td> */}

                    {/* Actions */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <button
                        onClick={() => setViewingItem(item)}
                        className="text-blue-600 hover:text-blue-700 transition-colors duration-150"
                        title="View item details"
                      >
                        <Eye size={20} strokeWidth={2.2} />
                      </button>
                        <button
                          onClick={() => onEdit(item)}
                          className="text-gray-700 hover:text-gray-900 transition-colors duration-150"
                          title="Edit item"
                        >
                          <Edit size={20} strokeWidth={2.2} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item._id)}
                          className="text-red-600 hover:text-red-700 transition-colors duration-150"
                          title="Delete item"
                        >
                          <Trash2 size={20} strokeWidth={2.2} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Delete Confirmation Row */}
                  {deletingId === item._id && (
                    <tr className="bg-red-50 border-t-2 border-red-200">
                      <td colSpan={7} className="px-8 py-6">
                        <div className="flex items-center justify-between gap-6">
                          <div>
                            <p className="text-base font-bold text-red-900">
                              Delete "{item.itemName}"?
                            </p>
                            <p className="text-sm text-red-700 mt-1.5">
                              This action cannot be undone. All images will be removed.
                            </p>
                          </div>
                          <div className="flex gap-3 flex-shrink-0">
                            <button
                              onClick={() => handleConfirmDelete(item._id)}
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-600">
            Showing <span className="font-bold text-gray-900">{items.length}</span> item{items.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Details Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Item Details</h2>
              <button
                onClick={() => setViewingItem(null)}
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
                  <div className="w-40 h-40 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                    <Image
                      src={viewingItem.mainImage}
                      alt={viewingItem.itemName}
                      width={160}
                      height={160}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Product Name</p>
                      <p className="text-base font-semibold text-gray-900">{viewingItem.itemName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Model</p>
                      <p className="text-base font-mono text-gray-700">{viewingItem.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Slug</p>
                      <p className="text-base font-mono text-gray-700">{viewingItem.slug}</p>
                    </div>
                    {viewingItem.isNewArrival && (
                      <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm font-semibold">New Arrival</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Component & Brand */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 font-medium">Component</p>
                  <p className="inline-flex text-sm font-semibold text-violet-700 bg-violet-50 px-3 py-1.5 rounded-lg border border-violet-200">
                    {viewingItem.component.componentName}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 font-medium">Brand</p>
                  {viewingItem.brand ? (
                    <p className="inline-flex text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                      {viewingItem.brand.brandName}
                    </p>
                  ) : (
                    <p className="text-gray-500">Not assigned</p>
                  )}
                </div>
              </div>

              {/* Filter Values */}
              {viewingItem.filterValues.length > 0 && (
                <div className="space-y-3 bg-brand-red/5 p-6 rounded-lg border border-brand-red/20">
                  <h3 className="text-lg font-semibold text-gray-900">Specifications</h3>
                  <div className="space-y-2">
                    {viewingItem.filterValues.map((fv, idx) => (
                      <div key={idx} className="flex justify-between">
                        <p className="text-sm font-medium text-gray-700">{fv.filterLabel}:</p>
                        <p className="text-sm font-semibold text-gray-900">{fv.filterValue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing & Availability */}
              <div className="space-y-3 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Pricing & Availability</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-base text-gray-700">Unit Price:</p>
                    <p className="text-lg font-bold text-gray-900">LKR {viewingItem.unitPrice.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-base text-gray-700">Availability:</p>
                    <p
                      className={`text-sm font-semibold px-3 py-1 rounded-lg ${
                        availabilityBadges[viewingItem.availability]?.color
                      } ${availabilityBadges[viewingItem.availability]?.textColor}`}
                    >
                      {viewingItem.availability === 'InStock' && 'In Stock'}
                      {viewingItem.availability === 'OutOfStock' && 'Out of Stock'}
                      {viewingItem.availability === 'PreOrder' && 'Pre Order'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                <p className="text-base text-gray-700 leading-relaxed">{viewingItem.description}</p>
              </div>

              {/* Additional Specifications */}
              {viewingItem.specifications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Additional Specifications</h3>
                  <div className="space-y-2">
                    {viewingItem.specifications.map((spec, idx) => (
                      <div key={idx} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                        <p className="text-sm font-medium text-gray-700">{spec.label}:</p>
                        <p className="text-sm text-gray-900">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Images */}
              {(viewingItem.mainImage || viewingItem.subImages.length > 0) && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {/* Main Image */}
                    <div className="rounded-lg overflow-hidden bg-gray-100 border-2 border-brand-red">
                      <Image
                        src={viewingItem.mainImage}
                        alt="Main"
                        width={150}
                        height={150}
                        className="object-cover w-full h-40"
                      />
                      <p className="text-xs font-semibold text-center bg-brand-red text-white py-1">Main</p>
                    </div>
                    {/* Sub Images */}
                    {viewingItem.subImages.map((image, idx) => (
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
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-8 py-4 bg-gray-50 flex gap-3">
              <button
                onClick={() => setViewingItem(null)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onEdit(viewingItem)
                  setViewingItem(null)
                }}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Edit This Item
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}