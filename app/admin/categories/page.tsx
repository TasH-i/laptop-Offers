// app/admin/categories/page.tsx

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2, Search, X, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import CategoryForm from '@/components/Admin/CategoryForm'
import CategoriesList from '@/components/Admin/CategoriesList'

interface Category {
  _id: string
  categoryName: string
  categoryDescription: string
  categoryImage: string
  isActive: boolean
  createdAt: string
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDownButton, setShowDownButton] = useState(false)
  const [showUpButton, setShowUpButton] = useState(false)
  const [scrollContainerRef, setScrollContainerRef] = useState<HTMLDivElement | null>(null)
  const formSectionRef = React.useRef<HTMLDivElement>(null)

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories

    const query = searchQuery.toLowerCase().trim()
    return categories.filter(
      (category) =>
        category.categoryName.toLowerCase().includes(query) ||
        category.categoryDescription.toLowerCase().includes(query)
    )
  }, [categories, searchQuery])

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Scroll to form when it's shown
  useEffect(() => {
    if (showForm && formSectionRef.current && scrollContainerRef) {
      setTimeout(() => {
        formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
    }
  }, [showForm, scrollContainerRef])

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef) {
        const scrollTop = scrollContainerRef.scrollTop
        const scrollHeight = scrollContainerRef.scrollHeight
        const clientHeight = scrollContainerRef.clientHeight

        // Check if scrollable
        const isScrollable = scrollHeight > clientHeight

        // Check if at bottom (within 50px)
        const atBottom = scrollHeight - scrollTop - clientHeight < 50

        // Check if can scroll down (not at bottom)
        const canScrollDown = scrollTop < scrollHeight - clientHeight - 50

        // Show down button if scrollable and can scroll down
        setShowDownButton(isScrollable && canScrollDown)

        // Show up button if scrollable and at bottom
        setShowUpButton(isScrollable && atBottom)
      }
    }

    const container = scrollContainerRef
    if (container) {
      container.addEventListener('scroll', handleScroll)
      handleScroll() // Check initial state
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [scrollContainerRef])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/categories')
      const data = await response.json()

      if (response.ok) {
        setCategories(data.categories)
      } else {
        toast.error(data.error || 'Failed to fetch categories')
      }
    } catch (error) {
      console.error('Fetch categories error:', error)
      toast.error('Failed to fetch categories. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSubmit = async (formData: {
    categoryName: string
    categoryDescription: string
    categoryImage: string
  }) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Category created successfully!')
        setCategories((prev) => [data.category, ...prev])
        setShowForm(false)
      } else {
        toast.error(data.error || 'Failed to create category')
      }
    } catch (error) {
      console.error('Create category error:', error)
      toast.error('Failed to create category. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (formData: {
    categoryName: string
    categoryDescription: string
    categoryImage: string
  }) => {
    if (!editingCategory) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Category updated successfully!')
        setCategories((prev) =>
          prev.map((c) => (c._id === editingCategory._id ? data.category : c))
        )
        setEditingCategory(null)
        setShowForm(false)
      } else {
        toast.error(data.error || 'Failed to update category')
      }
    } catch (error) {
      console.error('Update category error:', error)
      toast.error('Failed to update category. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Category deleted successfully!')
        setCategories((prev) => prev.filter((c) => c._id !== categoryId))
      } else {
        toast.error(data.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Delete category error:', error)
      toast.error('Failed to delete category. Please try again.')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  const handleScrollDown = () => {
    if (scrollContainerRef) {
      scrollContainerRef.scrollBy({
        top: 400,
        behavior: 'smooth',
      })
    }
  }

  const handleScrollUp = () => {
    if (scrollContainerRef) {
      scrollContainerRef.scrollBy({
        top: -400,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-40 bg-gray-50 border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-8 pb-4 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-3 text-sm">
                <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">
                  Dashboard
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-700 font-medium">Categories</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-600 text-lg mt-2">
                Manage all product categories in your store
              </p>
            </div>

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-7 py-3.5 bg-brand-red text-white text-base font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
              >
                <Plus size={20} />
                Create Category
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by category name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-12 py-3.5 text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Results count */}
          {searchQuery && (
            <div className="text-sm text-gray-600">
              Found <span className="font-semibold text-gray-900">{filteredCategories.length}</span> categor{filteredCategories.length !== 1 ? 'ies' : 'y'} matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content Section - with hidden scrollbar */}
      <div 
        className="flex-1 overflow-y-auto scrollbar-hide relative"
        ref={setScrollContainerRef}
      >
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
          {/* Create/Edit Form Section */}
          {showForm && (
            <div ref={formSectionRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h2>
                <p className="text-gray-600 text-base">
                  {editingCategory
                    ? 'Update category information and image'
                    : 'Add a new category to your store'}
                </p>
              </div>

              <CategoryForm
                initialData={
                  editingCategory
                    ? {
                        id: editingCategory._id,
                        categoryName: editingCategory.categoryName,
                        categoryDescription: editingCategory.categoryDescription,
                        categoryImage: editingCategory.categoryImage,
                      }
                    : undefined
                }
                onSubmit={editingCategory ? handleEditSubmit : handleCreateSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
              />
            </div>
          )}

          {/* Categories List Section */}
          <div className={showForm ? 'opacity-50 pointer-events-none' : ''}>
            <CategoriesList
              categories={filteredCategories}
              isLoading={isLoading}
              onEdit={(category) => {
                setEditingCategory(category)
                setShowForm(true)
              }}
              onDelete={handleDelete}
            />
          </div>
        </div>

        {/* Floating Scroll Down Button - Centered */}
        {showDownButton && (
          <button
            onClick={handleScrollDown}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-brand-red text-white shadow-lg hover:shadow-xl hover:bg-red-700 transition-all duration-300 flex items-center justify-center animate-bounce z-30"
            title="Scroll down to see more categories"
          >
            <ChevronDown size={28} />
          </button>
        )}

        {/* Floating Scroll Up Button - Centered */}
        {showUpButton && (
          <button
            onClick={handleScrollUp}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-brand-red text-white shadow-lg hover:shadow-xl hover:bg-red-700 transition-all duration-300 flex items-center justify-center animate-bounce z-30"
            title="Scroll up to see more"
          >
            <ChevronUp size={28} />
          </button>
        )}
      </div>
    </div>
  )
}