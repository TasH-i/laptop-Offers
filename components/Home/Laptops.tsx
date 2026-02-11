'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import laptopsData from '@/public/data/laptops.json'

interface Laptop {
  laptopId: number
  laptopSlug: string
  laptopName: string
  shortDescription: string
  offerPrice: number
  oldPrice?: number
  mainImage: string
  subImages: string[] | [] | null
  isNewArrival: boolean
}

const Laptops = () => {
  const [laptops] = useState<Laptop[]>(laptopsData.laptops)
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

  // Calculate savings percentage
  const calculateSavings = (offerPrice: number, oldPrice?: number) => {
    if (!oldPrice) return null
    const savings = Math.round(((oldPrice - offerPrice) / oldPrice) * 100)
    return savings
  }

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

  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="w-full bg-white py-8">
      {/* Header Section */}
      <div className="px-8 text-center mb-6 relative">
        <p className="text-gray-800 text-lg font-medium mb-1">Laptops</p>
        <h2 className="text-2xl md:text-5xl font-bold text-black mb-3 tracking-tight">
          Find the Laptop That Fits You
        </h2>

        {/* Navigation Buttons */}
        <div className="absolute my-4 md:my-6 lg:my-0 lg:top-20 right-8 lg:right-14 flex gap-2 items-center">
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
        className="w-full py-16 md:py-28 lg:py-18 overflow-x-auto scrollbar-hide cursor-pointer"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="flex w-max">
          {laptops.map((laptop, index) => {
            const savingsPercent = calculateSavings(laptop.offerPrice, laptop.oldPrice)

            return (
              <div
                key={laptop.laptopId}
                className="flex-shrink-0 relative w-[290px] md:w-[10.5%] lg:w-[12%]"
              >
                {/* Vertical Separator Line - Hidden on hover */}
                {index > 0 && (
                  <div
                    className={`absolute left-0 top-4 bottom-4 md:top-0 md:bottom-0 w-px bg-gray-300 transition-opacity duration-300 ${
                      hoveredCardId === laptop.laptopId ||
                      hoveredCardId === laptops[index - 1].laptopId
                        ? 'opacity-0'
                        : 'opacity-100'
                    }`}
                  />
                )}

                {/* Card Container with Hover Effects */}
                <div
                  onMouseEnter={() => setHoveredCardId(laptop.laptopId)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className={`h-full mx-4 px-6 py-10 flex flex-col items-center justify-center rounded-4xl transition-all duration-400 ${
                    hoveredCardId === laptop.laptopId
                      ? 'bg-white border border-gray-200 shadow-lg scale-105'
                      : 'bg-white border border-transparent scale-100'
                  }`}
                >
                  {/* Badge Section - Top */}
                  <div className="w-full mb-4 flex gap-2 justify-start min-h-6">
                    {laptop.isNewArrival && (
                      <span className="inline-block bg-[#a3d560] text-white text-xs font-bold px-3 py-1 rounded-full">
                        NEW ARRIVAL
                      </span>
                    )}
                    {savingsPercent !== null && savingsPercent > 0 && (
                      <span className="inline-block bg-[#ca0160] text-white text-xs font-bold px-3 py-1 rounded-full">
                        SAVE {savingsPercent}%
                      </span>
                    )}
                  </div>

                  {/* Laptop Image */}
                  <div className="mb-8 md:w-54 md:h-54 flex items-center justify-center overflow-hidden rounded-lg">
                    <img
                      src={laptop.mainImage}
                      alt={laptop.laptopName}
                      className="w-full h-full object-contain cursor-pointer"
                    />
                  </div>

                  {/* Laptop Name */}
                  <h3 className="text-lg font-medium text-gray-900 text-center mb-4 line-clamp-2">
                    {laptop.laptopName}
                  </h3>

                  {/* Short Description */}
                  {/* <p className="text-xs text-gray-600 text-center mb-4 line-clamp-2 leading-relaxed">
                    {laptop.shortDescription}
                  </p> */}

                  {/* Price Section */}
                  <div className="mb-4 flex flex-col items-center gap-3">
                    <div className="flex gap-3 md:gap-5 items-center justify-center">
                      <span className="text-md font-medium text-gray-900">
                        LKR {formatPrice(laptop.offerPrice)}
                      </span>
                      {laptop.oldPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          LKR {formatPrice(laptop.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Shop Now Button */}
                  <button
                    suppressHydrationWarning
                    className="text-sm font-bold text-gray-900 hover:text-brand-red transition-colors duration-200 underline"
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Laptops