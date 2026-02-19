// app/admin/components/page.tsx

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2, Search, X, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import ComponentForm from '@/components/Admin/ComponentForm'
import ComponentsList from '@/components/Admin/ComponentsList'

interface Component {
  _id: string
  componentName: string
  filterLabels: string[]
  isActive: boolean
  createdAt: string
}

export default function AdminComponentsPage() {
  const [components, setComponents] = useState<Component[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingComponent, setEditingComponent] = useState<Component | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDownButton, setShowDownButton] = useState(false)
  const [showUpButton, setShowUpButton] = useState(false)
  const [scrollContainerRef, setScrollContainerRef] = useState<HTMLDivElement | null>(null)
  const formSectionRef = React.useRef<HTMLDivElement>(null)

  // Filter components based on search query
  const filteredComponents = useMemo(() => {
    if (!searchQuery.trim()) return components

    const query = searchQuery.toLowerCase().trim()
    return components.filter(
      (component) =>
        component.componentName.toLowerCase().includes(query) ||
        component.filterLabels.some((label) => label.toLowerCase().includes(query))
    )
  }, [components, searchQuery])

  // Fetch components on mount
  useEffect(() => {
    fetchComponents()
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

  const fetchComponents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/components')
      const data = await response.json()

      if (response.ok) {
        setComponents(data.components)
      } else {
        toast.error(data.error || 'Failed to fetch components')
      }
    } catch (error) {
      console.error('Fetch components error:', error)
      toast.error('Failed to fetch components. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSubmit = async (formData: any) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Component created successfully!')
        setComponents((prev) => [data.component, ...prev])
        setShowForm(false)
      } else {
        toast.error(data.error || 'Failed to create component')
      }
    } catch (error) {
      console.error('Create component error:', error)
      toast.error('Failed to create component. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (formData: any) => {
    if (!editingComponent) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/components/${editingComponent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Component updated successfully!')
        setComponents((prev) =>
          prev.map((c) => (c._id === editingComponent._id ? data.component : c))
        )
        setEditingComponent(null)
        setShowForm(false)
      } else {
        toast.error(data.error || 'Failed to update component')
      }
    } catch (error) {
      console.error('Update component error:', error)
      toast.error('Failed to update component. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (componentId: string) => {
    try {
      const response = await fetch(`/api/admin/components/${componentId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Component deleted successfully!')
        setComponents((prev) => prev.filter((c) => c._id !== componentId))
      } else {
        toast.error(data.error || 'Failed to delete component')
      }
    } catch (error) {
      console.error('Delete component error:', error)
      toast.error('Failed to delete component. Please try again.')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingComponent(null)
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
                <span className="text-gray-700 font-medium">Components</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Components</h1>
              <p className="text-gray-600 text-lg mt-2">
                Manage computer components and their specifications
              </p>
            </div>

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-7 py-3.5 bg-brand-red text-white text-base font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
              >
                <Plus size={20} />
                Add Component
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by component name or filter label..."
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
              Found <span className="font-semibold text-gray-900">{filteredComponents.length}</span> component{filteredComponents.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </div>
          )}
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
                  {editingComponent ? 'Edit Component' : 'Create New Component'}
                </h2>
                <p className="text-gray-600 text-base">
                  {editingComponent
                    ? 'Update component name and filter labels'
                    : 'Add a new component type to your store'}
                </p>
              </div>

              <ComponentForm
                initialData={
                  editingComponent
                    ? {
                        id: editingComponent._id,
                        componentName: editingComponent.componentName,
                        filterLabels: editingComponent.filterLabels,
                      }
                    : undefined
                }
                onSubmit={editingComponent ? handleEditSubmit : handleCreateSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
              />
            </div>
          )}

          {/* Components List Section */}
          <div className={showForm ? 'opacity-50 pointer-events-none' : ''}>
            <ComponentsList
              components={filteredComponents}
              isLoading={isLoading}
              onEdit={(component) => {
                setEditingComponent(component)
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