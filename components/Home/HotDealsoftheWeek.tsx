'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, ArrowRight, ChevronRight, Heart } from 'lucide-react'
import laptopsData from '@/public/data/laptops.json'
import Button from '../ui/button'

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

const HotDealsoftheWeek = () => {
    const [laptops] = useState<Laptop[]>(laptopsData.laptops)
    const [scrollPosition, setScrollPosition] = useState(0)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)
    const [wishlist, setWishlist] = useState<number[]>([])
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const CARD_WIDTH = 320
    const GAP = 20

    // Calculate savings percentage
    const calculateSavings = (offerPrice: number, oldPrice?: number) => {
        if (!oldPrice) return null
        const savings = Math.round(((oldPrice - offerPrice) / oldPrice) * 100)
        return savings > 0 ? savings : null
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

    // Toggle wishlist
    const toggleWishlist = (laptopId: number) => {
        setWishlist((prev) =>
            prev.includes(laptopId)
                ? prev.filter((id) => id !== laptopId)
                : [...prev, laptopId]
        )
    }

    // Format price with currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price)
    }

    return (
        <div
            className="w-full py-16 md:py-24 lg:py-26 relative bg-cover bg-center"
            style={{
                backgroundImage: 'url(/images/28.webp)',
            }}
        >
            {/* Overlay for better text visibility */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Content Container */}
            <div className="relative z-10 px-4 md:px-8 lg:px-12">
                {/* Header Section */}
                <div className="text-center mb-12 md:mb-16">
                    <p className="text-white/80 text-sm md:text-base font-medium mb-3 tracking-widest uppercase">
                        Hot Deals of the Week
                    </p>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                        Hot Laptop Deals This Week
                    </h2>
                    <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto">
                        Limited-time offers on top laptop brands. Grab the best price before stocks run out.
                    </p>
                </div>

                {/* Carousel Container */}
                <div className="relative">
                    {/* Carousel Wrapper */}
                    <div
                        ref={scrollContainerRef}
                        className="w-full overflow-x-auto scrollbar-hide"
                        style={{
                            scrollBehavior: 'smooth',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        <div className="flex gap-5 w-max px-4 md:px-0">
                            {laptops.map((laptop) => {
                                const savingsPercent = calculateSavings(laptop.offerPrice, laptop.oldPrice)
                                const isWishlisted = wishlist.includes(laptop.laptopId)

                                return (
                                    <div
                                        key={laptop.laptopId}
                                        className="shrink-0 w-fit md:max-w-80 max-w-76 rounded-3xl overflow-hidden"
                                    >
                                        {/* Card */}
                                        <div className="bg-white h-full rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 flex flex-col">
                                            <div className='relative justify-between'>
                                                {/* Badges */}
                                                <div className="px-6 pt-4 flex gap-2 flex-wrap min-h-8">
                                                    {laptop.isNewArrival && (
                                                        <span className="inline-block bg-[#a3d560] text-white text-xs font-bold px-3 py-1 rounded-full">
                                                            NEW ARRIVAL
                                                        </span>
                                                    )}
                                                    {savingsPercent !== null && (
                                                        <span className="inline-block bg-[#ca0160] text-white text-xs font-bold px-3 py-1 rounded-full">
                                                            SAVE {savingsPercent}%
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Wishlist Button */}
                                                <button
                                                    onClick={() => toggleWishlist(laptop.laptopId)}
                                                    className="absolute top-4 right-4 z-10 px-2 rounded-full transition-all duration-200 group-hover:scale-110"
                                                >
                                                    <Heart
                                                        size={20}
                                                        className={`transition-all duration-200 ${isWishlisted
                                                            ? 'fill-[#ca0160] text-[#ca0160]'
                                                            : 'text-[#ca0160] hover:scale-110'
                                                            }`}
                                                    />
                                                </button>
                                            </div>

                                            {/* Image Container */}
                                            <div className="relative bg-gradient-to-b from-gray-50 to-white p-6 flex-shrink-0 h-64 md:h-62 flex items-center justify-center group">
                                                {/* Product Image */}
                                                <img
                                                    src={laptop.mainImage}
                                                    alt={laptop.laptopName}
                                                    className="w-full h-full object-contain cursor-pointer transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 flex flex-col px-6 py-4">
                                                {/* Product Name */}
                                                <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 leading-tight">
                                                    {laptop.laptopName}
                                                </h3>

                                                {/* Specs */}
                                                <p className="text-sm text-gray-700 mb-4 line-clamp-2 leading-relaxed">
                                                    {laptop.shortDescription}
                                                </p>

                                                {/* Spacer */}
                                                <div className="flex-1" />

                                                {/* Price Section */}
                                                <div className="mb-6">
                                                    {/* <p className="text-xs text-gray-500 mb-1">Offer Price:</p> */}
                                                    <div className="flex items-center gap-4">
                                                        <div className=" font-medium text-gray-900">
                                                            <span>Offer Price :</span> <br /> <span className='font-black text-xl'> LKR {formatPrice(laptop.offerPrice)}</span>
                                                        </div>
                                                        {laptop.oldPrice && (
                                                            <div className="text-sm font-medium text-gray-400">
                                                                <span>Old Price :</span> <br /> <span className='font-semibold line-through'>LKR {formatPrice(laptop.oldPrice)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-1 justify-between items-center">
                                                    <Button href='/shop' textSize="text-xs">Shop Now</Button>

                                                    <button className="flex gap-2 text-gray-700 font-bold rounded-full transition-all duration-200 text-xs md:text-sm">
                                                        VIEW DEAL
                                                        <div className='p-1 rounded-full bg-black text-white flex justify-center items-center'>
                                                            <ChevronRight size={12} strokeWidth={3} />
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 justify-center items-center mt-8 md:mt-12">
                        {/* Left Button */}
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className={`p-2 rounded-full border-2 transition-all duration-300 ${canScrollLeft
                                ? 'border-white hover:bg-white/10 text-white cursor-pointer'
                                : 'border-white/30 text-white/30 cursor-not-allowed'
                                }`}
                            aria-label="Scroll left"
                        >
                            <ArrowLeft size={24} strokeWidth={2.5} />
                        </button>

                        {/* Right Button */}
                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className={`p-4 rounded-full border-2 transition-all duration-300 ${canScrollRight
                                ? 'border-white hover:bg-white/10 text-white cursor-pointer'
                                : 'border-white/30 text-white/30 cursor-not-allowed'
                                }`}
                            aria-label="Scroll right"
                        >
                            <ArrowRight size={24} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HotDealsoftheWeek