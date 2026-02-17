// app/admin/brands/page.tsx (UPDATED - Two Separate Scroll Buttons)

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, ArrowLeft, Loader2, Search, X, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import BrandForm from '@/components/Admin/BrandForm'
import BrandsList from '@/components/Admin/BrandsList'

interface Brand {
  _id: string
  brandName: string
  brandDescription: string
  brandImage: string
  isActive: boolean
  createdAt: string
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDownButton, setShowDownButton] = useState(false)
  const [showUpButton, setShowUpButton] = useState(false)
  const [scrollContainerRef, setScrollContainerRef] = useState<HTMLDivElement | null>(null)

  // Filter brands based on search query
  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return brands

    const query = searchQuery.toLowerCase().trim()
    return brands.filter(
      (brand) =>
        brand.brandName.toLowerCase().includes(query) ||
        brand.brandDescription.toLowerCase().includes(query)
    )
  }, [brands, searchQuery])

  // Fetch brands on mount
  useEffect(() => {
    fetchBrands()
  }, [])

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

  const fetchBrands = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/brands')
      const data = await response.json()

      if (response.ok) {
        setBrands(data.brands)
      } else {
        toast.error(data.error || 'Failed to fetch brands')
      }
    } catch (error) {
      console.error('Fetch brands error:', error)
      toast.error('Failed to fetch brands. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSubmit = async (formData: {
    brandName: string
    brandDescription: string
    brandImage: string
  }) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Brand created successfully!')
        setBrands((prev) => [data.brand, ...prev])
        setShowForm(false)
      } else {
        toast.error(data.error || 'Failed to create brand')
      }
    } catch (error) {
      console.error('Create brand error:', error)
      toast.error('Failed to create brand. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (formData: {
    brandName: string
    brandDescription: string
    brandImage: string
  }) => {
    if (!editingBrand) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/brands/${editingBrand._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Brand updated successfully!')
        setBrands((prev) =>
          prev.map((b) => (b._id === editingBrand._id ? data.brand : b))
        )
        setEditingBrand(null)
        setShowForm(false)
      } else {
        toast.error(data.error || 'Failed to update brand')
      }
    } catch (error) {
      console.error('Update brand error:', error)
      toast.error('Failed to update brand. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (brandId: string) => {
    try {
      const response = await fetch(`/api/admin/brands/${brandId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Brand deleted successfully!')
        setBrands((prev) => prev.filter((b) => b._id !== brandId))
      } else {
        toast.error(data.error || 'Failed to delete brand')
      }
    } catch (error) {
      console.error('Delete brand error:', error)
      toast.error('Failed to delete brand. Please try again.')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingBrand(null)
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
              <div className="flex items-center gap-3 mb-3">
                <Link
                  href="/admin"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft size={24} />
                </Link>
                <h1 className="text-4xl font-bold text-gray-900">Brands</h1>
              </div>
              <p className="text-gray-600 text-lg">
                Manage all brands in your store
              </p>
            </div>

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-7 py-3.5 bg-brand-red text-white text-base font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
              >
                <Plus size={20} />
                Create Brand
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by brand name or description..."
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
              Found <span className="font-semibold text-gray-900">{filteredBrands.length}</span> brand{filteredBrands.length !== 1 ? 's' : ''} matching "{searchQuery}"
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {editingBrand ? 'Edit Brand' : 'Create New Brand'}
                </h2>
                <p className="text-gray-600 text-base">
                  {editingBrand
                    ? 'Update brand information and image'
                    : 'Add a new brand to your store'}
                </p>
              </div>

              <BrandForm
                initialData={
                  editingBrand
                    ? {
                        id: editingBrand._id,
                        brandName: editingBrand.brandName,
                        brandDescription: editingBrand.brandDescription,
                        brandImage: editingBrand.brandImage,
                      }
                    : undefined
                }
                onSubmit={editingBrand ? handleEditSubmit : handleCreateSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
              />
            </div>
          )}

          {/* Brands List Section */}
          <div className={showForm ? 'opacity-50 pointer-events-none' : ''}>
            <BrandsList
              brands={filteredBrands}
              isLoading={isLoading}
              onEdit={(brand) => {
                setEditingBrand(brand)
                setShowForm(true)
                window.scrollTo({ top: 0, behavior: 'smooth' })
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
            title="Scroll down to see more brands"
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