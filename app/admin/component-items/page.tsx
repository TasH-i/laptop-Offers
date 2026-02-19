// app/admin/component-items/page.tsx

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2, Search, X, ChevronDown, ChevronUp, Star } from 'lucide-react'
import Link from 'next/link'
import ComponentItemForm from '@/components/Admin/ComponentItemForm'
import ComponentItemsList from '@/components/Admin/ComponentItemsList'

interface Brand {
  _id: string
  brandName: string
}

interface Component {
  _id: string
  componentName: string
  filterLabels: string[]
}

interface ComponentItem {
  _id: string
  itemName: string
  slug: string
  component: Component
  brand?: Brand
  model: string
  unitPrice: number
  availability: 'InStock' | 'OutOfStock' | 'PreOrder'
  mainImage: string
  isNewArrival: boolean
  isActive: boolean
  createdAt: string
}

type SortOption = 'newest' | 'price-low' | 'price-high'

export default function AdminComponentItemsPage() {
  const [items, setItems] = useState<ComponentItem[]>([])
  const [components, setComponents] = useState<Component[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ComponentItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [selectedComponent, setSelectedComponent] = useState<string>('')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [filterNewArrival, setFilterNewArrival] = useState(false)
  const [showComponentDropdown, setShowComponentDropdown] = useState(false)
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const [showDownButton, setShowDownButton] = useState(false)
  const [showUpButton, setShowUpButton] = useState(false)
  const [scrollContainerRef, setScrollContainerRef] = useState<HTMLDivElement | null>(null)
  const formSectionRef = React.useRef<HTMLDivElement>(null)

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = items

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(
        (item) =>
          item.itemName.toLowerCase().includes(query) ||
          item.slug.toLowerCase().includes(query) ||
          item.model.toLowerCase().includes(query)
      )
    }

    // Component filter
    if (selectedComponent) {
      result = result.filter((item) => item.component._id === selectedComponent)
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter((item) => item.brand && selectedBrands.includes(item.brand._id))
    }

    // New Arrival filter
    if (filterNewArrival) {
      result = result.filter((item) => item.isNewArrival)
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.unitPrice - b.unitPrice)
        break
      case 'price-high':
        result.sort((a, b) => b.unitPrice - a.unitPrice)
        break
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return result
  }, [items, searchQuery, sortBy, selectedComponent, selectedBrands, filterNewArrival])

  // Fetch items on mount
  useEffect(() => {
    fetchItems()
    fetchComponents()
    fetchBrands()
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

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/component-items')
      const data = await response.json()

      if (response.ok) {
        setItems(data.items)
      } else {
        toast.error(data.error || 'Failed to fetch component items')
      }
    } catch (error) {
      console.error('Fetch items error:', error)
      toast.error('Failed to fetch component items. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchComponents = async () => {
    try {
      const response = await fetch('/api/admin/components')
      const data = await response.json()
      if (response.ok) {
        setComponents(data.components)
      }
    } catch (error) {
      console.error('Fetch components error:', error)
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

  const handleCreateSubmit = async (formData: any) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/component-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Component item created successfully!')
        setItems((prev) => [data.item, ...prev])
        setShowForm(false)
      } else {
        toast.error(data.error || 'Failed to create component item')
      }
    } catch (error) {
      console.error('Create item error:', error)
      toast.error('Failed to create component item. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (formData: any) => {
    if (!editingItem) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/component-items/${editingItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Component item updated successfully!')
        setItems((prev) =>
          prev.map((i) => (i._id === editingItem._id ? data.item : i))
        )
        setEditingItem(null)
        setShowForm(false)
      } else {
        toast.error(data.error || 'Failed to update component item')
      }
    } catch (error) {
      console.error('Update item error:', error)
      toast.error('Failed to update component item. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    try {
      const response = await fetch(`/api/admin/component-items/${itemId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Component item deleted successfully!')
        setItems((prev) => prev.filter((i) => i._id !== itemId))
      } else {
        toast.error(data.error || 'Failed to delete component item')
      }
    } catch (error) {
      console.error('Delete item error:', error)
      toast.error('Failed to delete component item. Please try again.')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingItem(null)
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
                <span className="text-gray-700 font-medium">Component Items</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Component Items</h1>
              <p className="text-gray-600 text-lg mt-2">
                Manage component specifications and inventory
              </p>
            </div>

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-7 py-3.5 bg-brand-red text-white text-base font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
              >
                <Plus size={20} />
                Add Item
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

              {/* Component Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowComponentDropdown(!showComponentDropdown)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Component {selectedComponent ? '(1)' : ''}
                  <ChevronDown size={14} className={`transition-transform ${showComponentDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showComponentDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                      <button
                        onClick={() => {
                          setSelectedComponent('')
                          setShowComponentDropdown(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded"
                      >
                        All Components
                      </button>
                      <div className="h-px bg-gray-200 my-1" />
                      {components.map((comp) => (
                        <button
                          key={comp._id}
                          onClick={() => {
                            setSelectedComponent(comp._id)
                            setShowComponentDropdown(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                            selectedComponent === comp._id
                              ? 'bg-brand-red/10 text-brand-red font-semibold'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {comp.componentName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
              {(selectedComponent || selectedBrands.length > 0 || filterNewArrival) && (
                <>
                  <div className="h-5 w-px bg-gray-200" />
                  <button
                    onClick={() => {
                      setSelectedComponent('')
                      setSelectedBrands([])
                      setFilterNewArrival(false)
                      setShowComponentDropdown(false)
                      setShowBrandDropdown(false)
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
                placeholder="Search by name, slug, or model..."
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

          {/* Results Info */}
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{filteredItems.length}</span> item{filteredItems.length !== 1 ? 's' : ''}
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
                  {editingItem ? 'Edit Component Item' : 'Create New Component Item'}
                </h2>
                <p className="text-gray-600 text-base">
                  {editingItem
                    ? 'Update item specifications and details'
                    : 'Add a new component item with full specifications'}
                </p>
              </div>

              <ComponentItemForm
                initialData={editingItem}
                components={components}
                brands={brands}
                onSubmit={editingItem ? handleEditSubmit : handleCreateSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
              />
            </div>
          )}

          {/* Items List Section */}
          <div className={showForm ? 'opacity-50 pointer-events-none' : ''}>
            <ComponentItemsList
              items={filteredItems}
              isLoading={isLoading}
              onEdit={(item) => {
                setEditingItem(item)
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
            title="Scroll down"
          >
            <ChevronDown size={28} />
          </button>
        )}

        {/* Floating Scroll Up Button */}
        {showUpButton && (
          <button
            onClick={handleScrollUp}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-brand-red text-white shadow-lg hover:shadow-xl hover:bg-red-700 transition-all duration-300 flex items-center justify-center animate-bounce z-30"
            title="Scroll up"
          >
            <ChevronUp size={28} />
          </button>
        )}
      </div>
    </div>
  )
}