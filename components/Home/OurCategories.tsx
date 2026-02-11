'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import categoriesData from '@/public/data/categories.json'

interface Category {
  categoryId: number
  categoryName: string
  categoryImage: string
  categoryDescription?: string
}

const OurCategories = () => {
  const [categories] = useState<Category[]>(categoriesData.categories)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startScrollLeft = useRef(0)

  const CARD_WIDTH = 340
  const GAP = 0

  // Check scroll position and update button states
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setScrollPosition(scrollLeft)
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const container = scrollContainerRef.current
    container?.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)

    return () => {
      container?.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  // Smooth scroll navigation
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = CARD_WIDTH + GAP
      const newPosition =
        direction === 'right'
          ? scrollPosition + scrollAmount
          : scrollPosition - scrollAmount

      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth',
      })
    }
  }

  // Handle mouse down for manual drag
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    startX.current = e.clientX
    if (scrollContainerRef.current) {
      startScrollLeft.current = scrollContainerRef.current.scrollLeft
    }
  }

  // Handle mouse move for manual drag
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return

    const diff = e.clientX - startX.current
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = startScrollLeft.current - diff
    }
  }

  // Handle mouse up for manual drag
  const handleMouseUp = () => {
    isDragging.current = false
  }

  return (
    <div className="w-full bg-white py-18">
      {/* Header Section */}
      <div className="px-8 text-center mb-6 relative">
        <p className="text-gray-800 text-lg font-medium mb-1">Our Categories</p>
        <h2 className="text-2xl md:text-5xl font-bold text-black mb-3 tracking-tight">
          Find Your Perfect Laptop
        </h2>
        <p className="text-gray-600 text-sm md:text-lg lg:max-w-[45%] mx-auto leading-relaxed mb-6 md:mb-4 lg:mb-0">
          Browse laptops carefully selected to match your work, study, gaming, or
          everyday needs, making it easier to choose the right one.
        </p>

        {/* Navigation Buttons - Top Right */}
        <div className="absolute  lg:top-20 right-8 lg:right-14 flex gap-2 items-center ">
          {/* Left Button - Small */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            suppressHydrationWarning
            className={`p-2 rounded-full border-2 transition-all duration-300 ${
              canScrollLeft
                ? 'border-gray-800 hover:border-gray-800 hover:bg-gray-50'
                : 'border-gray-200 text-gray-300 cursor-not-allowed'
            }`}
            aria-label="Scroll left"
          >
            <ArrowLeft size={20} strokeWidth={3} />
          </button>

          {/* Right Button - Large */}
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            suppressHydrationWarning
            className={`p-3 md:p-5 rounded-full border-2 transition-all duration-300 ${
              canScrollRight
                ? 'border-gray-800 hover:bg-gray-50'
                : 'border-gray-200 text-gray-300 cursor-not-allowed'
            }`}
            aria-label="Scroll right"
          >
            <ArrowRight size={24} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full py-18 lg:py-8 overflow-x-auto scrollbar-hide cursor-pointer"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="flex w-max">
          {categories.map((category, index) => (
            <div
              key={category.categoryId}
              className="flex-shrink-0 relative w-[260px] md:w-[9%] lg:w-[10.8%]"
            //   style={{ width: `${CARD_WIDTH}px` }}
            >
              {/* Vertical Separator Line - Hidden on hover */}
              {index > 0 && (
                <div 
                  className={`absolute left-0 top-4 bottom-0 w-px bg-gray-300 transition-opacity duration-300 ${
                    hoveredCardId === category.categoryId || hoveredCardId === categories[index - 1].categoryId
                      ? 'opacity-0'
                      : 'opacity-100'
                  }`}
                />
              )}

              {/* Card Container with Hover Effects */}
              <div
                onMouseEnter={() => setHoveredCardId(category.categoryId)}
                onMouseLeave={() => setHoveredCardId(null)}
                className={`h-full mx-4 px-6 py-10 flex flex-col items-center justify-center rounded-4xl transition-all duration-400 ${
                  hoveredCardId === category.categoryId
                    ? 'bg-white border border-gray-200 shadow-lg scale-105'
                    : 'bg-white border border-transparent scale-100'
                }`}
              >
                {/* Category Image */}
                <div className="mb-8 md:w-54 md:h-54 flex items-center justify-center overflow-hidden rounded-lg">
                  <img
                    src={category.categoryImage}
                    alt={category.categoryName}
                    className="w-full h-full object-contain cursor-pointer"
                  />
                </div>

                {/* Category Name */}
                <h3 className="text-base font-bold text-gray-900 text-center mb-4 line-clamp-2">
                  {category.categoryName}
                </h3>

                {/* Shop Now Button */}
                <button suppressHydrationWarning className="text-sm font-bold text-gray-900 hover:text-brand-red transition-colors duration-200 underline">
                  Shop Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default OurCategories