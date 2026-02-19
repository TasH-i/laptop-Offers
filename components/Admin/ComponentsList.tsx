// components/Admin/ComponentsList.tsx

'use client'

import React, { useState } from 'react'
import { Edit, Trash2, Loader2, AlertCircle, Tag } from 'lucide-react'

interface Component {
  _id: string
  componentName: string
  filterLabels: string[]
  isActive: boolean
  createdAt: string
}

interface ComponentsListProps {
  components: Component[]
  isLoading: boolean
  onEdit: (component: Component) => void
  onDelete: (componentId: string) => void
}

export default function ComponentsList({
  components,
  isLoading,
  onEdit,
  onDelete,
}: ComponentsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDeleteClick = (componentId: string) => {
    setDeletingId(componentId)
  }

  const handleConfirmDelete = async (componentId: string) => {
    await onDelete(componentId)
    setDeletingId(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand-red mx-auto mb-4" />
          <p className="text-gray-600 text-base font-medium">Loading components...</p>
        </div>
      </div>
    )
  }

  if (components.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
        <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-700 text-lg font-semibold">No components yet</p>
        <p className="text-gray-500 text-base mt-2">Create your first component to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {components.map((component) => (
        <div
          key={component._id}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
        >
          {/* Header Section */}
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-brand-red/5 to-transparent">
            <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
              {component.componentName}
            </h3>
            <p className="text-sm text-gray-500">
              {component.filterLabels.length} filter{component.filterLabels.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Filter Labels Section */}
          <div className="px-6 py-5 flex-1">
            <div className="space-y-2">
              {component.filterLabels.map((label, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 bg-brand-red/10 text-brand-red px-3.5 py-2 rounded-lg border border-brand-red/20 text-sm font-medium"
                >
                  <Tag size={14} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-5 border-t border-gray-100 flex gap-3">
            <button
              onClick={() => onEdit(component)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Edit size={16} />
              Edit
            </button>
            <button
              onClick={() => handleDeleteClick(component._id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>

          {/* Delete Confirmation */}
          {deletingId === component._id && (
            <div className="px-6 pb-6 pt-4 space-y-3 border-t border-gray-100 bg-red-50">
              <p className="text-sm text-gray-700 font-medium">
                Delete "{component.componentName}"?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleConfirmDelete(component._id)}
                  className="flex-1 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}