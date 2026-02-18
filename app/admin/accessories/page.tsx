// app/admin/accessories/page.tsx (With Dropdown Filters + Search Bar)

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2, Search, X, ChevronDown, ChevronUp, Star } from 'lucide-react'
import Link from 'next/link'
import AccessoryForm from '@/components/Admin/AccessoryForm'
import AccessoriesList from '@/components/Admin/AccessoriesList'

interface Brand {
  _id: string
  brandName: string
}

interface Category {
  _id: string
  categoryName: string
}

interface Accessory {
  _id: string
  accessoryName: string
  slug: string
  brand?: Brand
  category?: Category
  description: string
  offerPrice: number
  oldPrice?: number
  mainImage: string
  subImages: string[]
  isNewArrival: boolean
  isActive: boolean
  createdAt: string
}

type SortOption = 'newest' | 'price-low' | 'price-high'

export default function AdminAccessoriesPage() {
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [filterNewArrival, setFilterNewArrival] = useState(false)
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showDownButton, setShowDownButton] = useState(false)
  const [showUpButton, setShowUpButton] = useState(false)
  const [scrollContainerRef, setScrollContainerRef] = useState<HTMLDivElement | null>(null)
  const formSectionRef = React.useRef<HTMLDivElement>(null)

  // Filter and sort accessories
  const filteredAccessories = useMemo(() => {
    let result = accessories

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(
        (accessory) =>
          accessory.accessoryName.toLowerCase().includes(query) ||
          accessory.slug.toLowerCase().includes(query) ||
          accessory.description.toLowerCase().includes(query)
      )
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter((accessory) => 
        accessory.brand && selectedBrands.includes(accessory.brand._id)
      )
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((accessory) => 
        accessory.category && selectedCategories.includes(accessory.category._id)
      )
    }

    // New Arrival filter
    if (filterNewArrival) {
      result = result.filter((accessory) => accessory.isNewArrival)
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.offerPrice - b.offerPrice)
        break
      case 'price-high':
        result.sort((a, b) => b.offerPrice - a.offerPrice)
        break
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return result
  }, [accessories, searchQuery, sortBy, selectedBrands, selectedCategories, filterNewArrival])

  // Pagination calculation
  const totalPages = Math.ceil(filteredAccessories.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAccessories = filteredAccessories.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy, selectedBrands, selectedCategories, filterNewArrival])

  // Fetch accessories on mount
  useEffect(() => {
    fetchAccessories()
    fetchBrands()
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

        const isScrollable = scrollHeight > clientHeight
        const atBottom = scrollHeight - scrollTop - clientHeight < 50
        const canScrollDown = scrollTop < scrollHeight - clientHeight - 50

        setShowDownButton(isScrollable && canScrollDown)
        setShowUpButton(isScrollable && atBottom)
      }
    }

    const container = scrollContainerRef
    if (container) {
      container.addEventListener('scroll', handleScroll)
      handleScroll()
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [scrollContainerRef])

  const fetchAccessories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/accessories')
      const data = await response.json()

      if (response.ok) {
        setAccessories(data.accessories)
      } else {
        toast.error(data.error || 'Failed to fetch accessories')
      }
    } catch (error) {
      console.error('Fetch accessories error:', error)
      toast.error('Failed to fetch accessories. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/admin/brands')
      const data = await response.json()
      if (response.ok) {
        setBrands(data.brands)
      }
    } catch (error) {
      console.error('Fetch brands error:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      const data = await response.json()
      if (response.ok) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Fetch categories error:', error)
    }
  }

  const handleCreateSubmit = async (formData: any) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/accessories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Accessory created successfully!')
        setAccessories((prev) => [data.accessory, ...prev])
        setShowForm(false)
      } else {
        toast.error(data.error || 'Failed to create accessory')
      }
    } catch (error) {
      console.error('Create accessory error:', error)
      toast.error('Failed to create accessory. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (formData: any) => {
    if (!editingAccessory) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/accessories/${editingAccessory._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Accessory updated successfully!')
        setAccessories((prev) =>
          prev.map((a) => (a._id === editingAccessory._id ? data.accessory : a))
        )
        setEditingAccessory(null)
        setShowForm(false)
      } else {
        toast.error(data.error || 'Failed to update accessory')
      }
    } catch (error) {
      console.error('Update accessory error:', error)
      toast.error('Failed to update accessory. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (accessoryId: string) => {
    try {
      const response = await fetch(`/api/admin/accessories/${accessoryId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Accessory deleted successfully!')
        setAccessories((prev) => prev.filter((a) => a._id !== accessoryId))
      } else {
        toast.error(data.error || 'Failed to delete accessory')
      }
    } catch (error) {
      console.error('Delete accessory error:', error)
      toast.error('Failed to delete accessory. Please try again.')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingAccessory(null)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  const handleScrollDown = () => {
    if (scrollContainerRef) {
      scrollContainerRef.scrollBy({ top: 400, behavior: 'smooth' })
    }
  }

  const handleScrollUp = () => {
    if (scrollContainerRef) {
      scrollContainerRef.scrollBy({ top: -400, behavior: 'smooth' })
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-40 bg-gray-50 border-b border-gray-200">
        <div className="px-8 pb-4 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-3 text-sm">
                <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">
                  Dashboard
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-700 font-medium">Accessories</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Accessories</h1>
              <p className="text-gray-600 text-lg mt-2">
                Manage all laptop accessories in your store
              </p>
            </div>

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-7 py-3.5 bg-brand-red text-white text-base font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
              >
                <Plus size={20} />
                Create Accessory
              </button>
            )}
          </div>

          {/* Filters & Search Row */}
          <div className="flex gap-3 items-start bg-white p-3 rounded-xl border border-gray-200">
            {/* Filters & Sort */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Low to High</option>
                  <option value="price-high">High to Low</option>
                </select>
              </div>

              {/* Divider */}
              <div className="h-5 w-px bg-gray-200" />

              {/* Brand Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Brand {selectedBrands.length > 0 && `(${selectedBrands.length})`}
                  <ChevronDown size={14} className={`transition-transform ${showBrandDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showBrandDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                      <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={selectedBrands.length === brands.length && brands.length > 0}
                          onChange={() => {
                            if (selectedBrands.length === brands.length) {
                              setSelectedBrands([])
                            } else {
                              setSelectedBrands(brands.map((b) => b._id))
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-brand-red cursor-pointer"
                        />
                        <span className="text-sm text-gray-900">All Brands</span>
                      </label>
                      <div className="h-px bg-gray-200 my-1" />
                      {brands.map((brand) => (
                        <label key={brand._id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand._id)}
                            onChange={() => {
                              setSelectedBrands((prev) =>
                                prev.includes(brand._id)
                                  ? prev.filter((id) => id !== brand._id)
                                  : [...prev, brand._id]
                              )
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-brand-red cursor-pointer"
                          />
                          <span className="text-sm text-gray-700">{brand.brandName}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Category {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                  <ChevronDown size={14} className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                      <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={selectedCategories.length === categories.length && categories.length > 0}
                          onChange={() => {
                            if (selectedCategories.length === categories.length) {
                              setSelectedCategories([])
                            } else {
                              setSelectedCategories(categories.map((c) => c._id))
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-brand-red cursor-pointer"
                        />
                        <span className="text-sm text-gray-900">All Categories</span>
                      </label>
                      <div className="h-px bg-gray-200 my-1" />
                      {categories.map((category) => (
                        <label key={category._id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category._id)}
                            onChange={() => {
                              setSelectedCategories((prev) =>
                                prev.includes(category._id)
                                  ? prev.filter((id) => id !== category._id)
                                  : [...prev, category._id]
                              )
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-brand-red cursor-pointer"
                          />
                          <span className="text-sm text-gray-700">{category.categoryName}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* New Arrival Filter */}
              <button
                onClick={() => setFilterNewArrival(!filterNewArrival)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  filterNewArrival
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Star size={14} fill={filterNewArrival ? 'currentColor' : 'none'} />
                New
              </button>

              {/* Clear Filters */}
              {(selectedBrands.length > 0 || selectedCategories.length > 0 || filterNewArrival) && (
                <>
                  <div className="h-5 w-px bg-gray-200" />
                  <button
                    onClick={() => {
                      setSelectedBrands([])
                      setSelectedCategories([])
                      setFilterNewArrival(false)
                      setShowBrandDropdown(false)
                      setShowCategoryDropdown(false)
                    }}
                    className="px-2.5 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="h-10 w-px bg-gray-200" />

            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, slug, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-12 py-2.5 text-base bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Results & Pagination */}
          <div className="flex items-center justify-between mt-4 gap-6">
            {/* Results Info - Left Side */}
            <div className="flex items-center gap-4">
              <div className="flex gap-2 text-md text-gray-600">
                <span className="block font-semibold text-md text-gray-900">{filteredAccessories.length}</span>
                <span>accessory{filteredAccessories.length !== 1 ? 'ies' : ''}</span>
              </div>
              
              <div className="h-8 w-px bg-gray-200" />
              
              {/* Items Per Page */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Per page</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-4 py-1.5 text-sm font-bold text-gray-900 border border-brand-red rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls - Right Side */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent transition-all"
              >
                ←
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                {currentPage > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="w-8 h-8 flex items-center justify-center rounded font-medium text-gray-600 hover:bg-white hover:text-gray-900 transition-all"
                    >
                      1
                    </button>
                    {currentPage > 2 && <span className="text-gray-400">...</span>}
                  </>
                )}
                
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-red text-white font-bold">
                  {currentPage}
                </div>

                {currentPage < totalPages && (
                  <>
                    {currentPage < totalPages - 1 && <span className="text-gray-400">...</span>}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-8 h-8 flex items-center justify-center rounded font-medium text-gray-600 hover:bg-white hover:text-gray-900 transition-all"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent transition-all"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div
        className="flex-1 overflow-y-auto scrollbar-hide relative"
        ref={setScrollContainerRef}
      >
        <div className="px-8 py-8 space-y-8">
          {/* Create/Edit Form Section */}
          {showForm && (
            <div ref={formSectionRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {editingAccessory ? 'Edit Accessory' : 'Create New Accessory'}
                </h2>
                <p className="text-gray-600 text-base">
                  {editingAccessory
                    ? 'Update accessory information and images'
                    : 'Add a new accessory to your store'}
                </p>
              </div>

              <AccessoryForm
                initialData={
                  editingAccessory
                    ? {
                        id: editingAccessory._id,
                        accessoryName: editingAccessory.accessoryName,
                        slug: editingAccessory.slug,
                        brand: editingAccessory.brand?._id,
                        category: editingAccessory.category?._id,
                        description: editingAccessory.description,
                        offerPrice: editingAccessory.offerPrice,
                        oldPrice: editingAccessory.oldPrice,
                        mainImage: editingAccessory.mainImage,
                        subImages: editingAccessory.subImages,
                        isNewArrival: editingAccessory.isNewArrival,
                      }
                    : undefined
                }
                brands={brands}
                categories={categories}
                onSubmit={editingAccessory ? handleEditSubmit : handleCreateSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
              />
            </div>
          )}

          {/* Accessories List Section */}
          <div className={showForm ? 'opacity-50 pointer-events-none' : ''}>
            <AccessoriesList
              accessories={paginatedAccessories}
              isLoading={isLoading}
              onEdit={(accessory) => {
                setEditingAccessory(accessory)
                setShowForm(true)
              }}
              onDelete={handleDelete}
            />
          </div>
        </div>

        {/* Floating Scroll Down Button */}
        {showDownButton && (
          <button
            onClick={handleScrollDown}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-brand-red text-white shadow-lg hover:shadow-xl hover:bg-red-700 transition-all duration-300 flex items-center justify-center animate-bounce z-30"
            title="Scroll down to see more accessories"
          >
            <ChevronDown size={28} />
          </button>
        )}

        {/* Floating Scroll Up Button */}
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