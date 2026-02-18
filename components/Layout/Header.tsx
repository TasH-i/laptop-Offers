// components/Layout/Header.tsx
'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Facebook, Twitter, Linkedin, Menu, X, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
    const { data: session, status } = useSession()
    const router = useRouter()

    // Sign-out dropdown state
    const [showSignOutDropdown, setShowSignOutDropdown] = useState(false)
    const [mobileShowSignOut, setMobileShowSignOut] = useState(false)
    const signOutRef = useRef<HTMLDivElement>(null)

    // Scroll detection — show profile pic in sticky header when bottom nav scrolls away
    const [showStickyProfile, setShowStickyProfile] = useState(false)
    const bottomNavRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const handleScroll = () => {
            if (bottomNavRef.current) {
                const rect = bottomNavRef.current.getBoundingClientRect()
                // Show sticky profile when bottom nav is fully above viewport
                setShowStickyProfile(rect.bottom < 0)
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close desktop dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (signOutRef.current && !signOutRef.current.contains(e.target as Node)) {
                setShowSignOutDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSignOut = async () => {
        setShowSignOutDropdown(false)
        setMobileShowSignOut(false)
        setMobileMenuOpen(false)
        toast.info('Signing you out...')
        await signOut({ redirect: false })
        toast.success('You have been signed out successfully.')
        router.push('/')
        router.refresh()
    }

    return (
        <>
            {/* Top Header - Desktop Only */}
            <section className="hidden lg:block bg-brand-red text-white lg:px-20">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between py-1.5 text-sm">
                        {/* Left side - Social icons and hotline */}
                        <div className="flex items-center gap-4">
                            {/* Social Media Icons */}
                            <div className="flex items-center gap-2">
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-full border-2 border-red-400 flex items-center justify-center hover:text-brand-red transition-all"
                                    aria-label="Facebook"
                                >
                                    <Facebook size={18} fill="white" strokeWidth={0} className='hover:scale-115 transition-transform duration-500' />
                                </a>
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-full border-2 border-red-400 flex items-center justify-center hover:text-brand-red transition-all"
                                    aria-label="Twitter"
                                >
                                    <Twitter size={18} fill="white" strokeWidth={0} className='hover:scale-115 transition-transform duration-500' />
                                </a>
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-full border-2 border-red-400 flex items-center justify-center hover:text-brand-red transition-all"
                                    aria-label="YouTube"
                                >
                                    {/* YouTube Play Button Icon */}
                                    <svg width="16" height="14" viewBox="0 0 20 14" fill="white" xmlns="http://www.w3.org/2000/svg" className='hover:scale-115 transition-transform duration-700'>
                                        <rect width="20" height="14" rx="3" fill="white" />
                                        <path d="M8 10L14 7L8 4V10Z" fill="#E60000" />
                                    </svg>
                                </a>
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-full border-2 border-red-400 flex items-center justify-center hover:text-brand-red transition-all"
                                    aria-label="LinkedIn"
                                >
                                    <Linkedin size={18} fill="white" strokeWidth={0} className='hover:scale-115 transition-transform duration-500' />
                                </a>
                            </div>

                            {/* Divider */}
                            <div className="h-4 w-px bg-white/30"></div>

                            {/* Hotline */}
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">HOTLINE:</span>
                                <a href="tel:+94112148400" className="hover:underline">
                                    +94 112 148 400
                                </a>
                                <span className="text-white/60">|</span>
                                <a href="mailto:info@laptopoffers.lk" className="hover:underline">
                                    info@laptopoffers.lk
                                </a>
                            </div>
                        </div>

                        {/* Right side - Navigation links */}
                        <div className="flex items-center gap-6">
                            <a href="#about" className="hover:underline font-medium">
                                ABOUT US
                            </a>
                            <a href="#contact" className="hover:underline font-medium">
                                CONTACT US
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Header */}
            <section className="bg-white border-b border-gray-200 lg:px-20 sticky top-0 z-50">
                <div className="container mx-auto px-4 lg:px-2 py-3 lg:py-5">
                    {/* Desktop Layout */}
                    <div className="hidden lg:flex items-center justify-between gap-8">
                        {/* Logo */}
                        <div className="shrink-0 h-15 w-76 relative">
                            <a href="/">
                                <Image
                                    src="/images/01.webp"
                                    alt="LaptopOffers.lk"
                                    fill
                                />
                            </a>
                        </div>

                        {/* Search Bar and Cart */}
                        <div className="flex items-center gap-4 flex-1 justify-end">
                            {/* Search Bar */}
                            <div className="relative flex-1 max-w-2xl">
                                <input
                                    type="text"
                                    placeholder="SEARCH HERE"
                                    className="w-full pl-6 pr-20 py-6 rounded-full bg-[#ededed] text-gray-600 font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm tracking-wider"
                                />
                                <button
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[#2a2a2a] hover:bg-black flex items-center justify-center transition-colors"
                                    aria-label="Search"
                                >
                                    <Image
                                        src="/images/02.webp"
                                        alt="Search"
                                        width={16}
                                        height={16}
                                    />
                                </button>
                            </div>

                            {/* Cart */}
                            <div className="flex items-center gap-3">
                                {/* Sticky Profile Avatar — appears when scrolled past bottom nav */}
                                {status === 'authenticated' && session && (
                                    <Link
                                        href="/account"
                                        className={`transition-all duration-300 ease-in-out ${
                                            showStickyProfile
                                                ? 'w-12 h-12 opacity-100 scale-100'
                                                : 'w-0 h-0 opacity-0 scale-50 overflow-hidden'
                                        }`}
                                    >
                                        <div className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-brand-red flex items-center justify-center transition-colors relative overflow-hidden">
                                            {session.user.image ? (
                                                <Image
                                                    src={session.user.image}
                                                    alt={session.user.name || 'Profile'}
                                                    fill
                                                    className="object-cover rounded-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-brand-red flex items-center justify-center text-white font-bold text-sm">
                                                    {session.user.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                )}

                                <div className="relative">
                                    <button
                                        className="w-18 h-18 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors relative"
                                        aria-label="Shopping Cart"
                                    >
                                        <Image
                                            src="/images/03.webp"
                                            alt="Cart"
                                            width={22}
                                            height={22}
                                        />
                                        {/* Cart Count Badge */}
                                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                            2
                                        </span>
                                    </button>
                                </div>

                                <div className="text-left">
                                    <div className="text-xs font-bold text-gray-500 tracking-widest">CART</div>
                                    <div className="text-lg font-bold text-gray-800 tracking-wide">LKR 200000.00</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile & Tablet Layout */}
                    <div className="lg:hidden">
                        {/* Top Row - Logo, Search Toggle, Cart, Menu */}
                        <div className="flex items-center justify-between gap-3">
                            {/* Logo */}
                            <div className="shrink-0 h-8 w-36 md:h-10 md:w-44 relative">
                                <a href="/">
                                    <Image
                                        src="/images/01.webp"
                                        alt="LaptopOffers.lk"
                                        fill
                                        className="object-contain"
                                    />
                                </a>
                            </div>

                            {/* Right Side Actions */}
                            <div className="flex items-center gap-4 md:gap-3">
                                {/* Search Toggle Button */}
                                <button
                                    onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                                    className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#2a2a2a] hover:bg-gray-200 flex items-center justify-center transition-colors"
                                    aria-label="Toggle Search"
                                >
                                    <Image
                                        src="/images/02.webp"
                                        alt="Search"
                                        width={18}
                                        height={18}
                                    />
                                </button>

                                {/* Profile Icon - Mobile/Tablet (always visible when logged in) */}
                                {status === 'authenticated' && session ? (
                                    <Link href="/account">
                                        <div className="w-10 h-10 md:w-11 md:h-11 rounded-full border-2 border-gray-300 hover:border-brand-red flex items-center justify-center transition-colors relative overflow-hidden">
                                            {session.user.image ? (
                                                <Image
                                                    src={session.user.image}
                                                    alt={session.user.name || 'Profile'}
                                                    fill
                                                    className="object-cover rounded-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-brand-red flex items-center justify-center text-white font-bold text-xs">
                                                    {session.user.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="w-10 h-10 md:w-11 md:h-11 rounded-full border-2 border-gray-300 hover:border-brand-red flex items-center justify-center transition-colors"
                                    >
                                        <Image
                                            src="/images/04.webp"
                                            alt="Account"
                                            width={18}
                                            height={18}
                                        />
                                    </Link>
                                )}

                                {/* Cart Button */}
                                <div className="relative">
                                    <button
                                        className="w-10 h-10 md:w-11 md:h-11 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors relative"
                                        aria-label="Shopping Cart"
                                    >
                                        <Image
                                            src="/images/03.webp"
                                            alt="Cart"
                                            width={18}
                                            height={18}
                                        />
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                            2
                                        </span>
                                    </button>
                                </div>

                                {/* Mobile Menu Toggle */}
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className=" rounded-lg  flex items-center justify-center transition-colors"
                                    aria-label="Toggle Menu"
                                >
                                    {mobileMenuOpen ? (
                                        <X size={26} className="text-brand-red font-bold" />
                                    ) : (
                                        <Menu size={26} className="text-brand-red font-bold" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Mobile Search Bar - Expandable */}
                        {mobileSearchOpen && (
                            <div className="mt-3 animate-in slide-in-from-top-2 duration-200 " >
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="SEARCH HERE"
                                        className="w-full pl-5 pr-16 py-3.5 md:py-4 rounded-full bg-[#ededed] text-gray-600 font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm tracking-wider"
                                    />
                                    <button
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#2a2a2a] hover:bg-black flex items-center justify-center transition-colors"
                                        aria-label="Search"
                                    >
                                        <Image
                                            src="/images/02.webp"
                                            alt="Search"
                                            width={16}
                                            height={16}
                                        />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Cart Info - Tablet Only */}
                        <div className="hidden md:flex items-center justify-end gap-2 mt-3">
                            <div className="text-right">
                                <div className="text-xs font-bold text-gray-500 tracking-widest">CART TOTAL</div>
                                <div className="text-base font-bold text-gray-800 tracking-wide">LKR 200000.00</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-200 bg-white/40 rounded-b-lg animate-in slide-in-from-top-2 duration-200">
                        <div className="container mx-auto px-4 py-4">
                            {/* Main Navigation Categories */}
                            <div className="space-y-1 pb-4 border-b border-gray-200">
                                {/* All Categories - Expandable */}
                                <button className="w-full flex items-center justify-between py-3 px-4 text-sm font-bold text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                                    <span className="tracking-wide">ALL CATEGORIES</span>
                                    <svg 
                                        width="10" 
                                        height="6" 
                                        viewBox="0 0 10 6" 
                                        fill="none" 
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                
                                {/* Laptops */}
                                <a 
                                    href="#laptops" 
                                    className="w-full flex items-center justify-between py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-red rounded-lg transition-colors"
                                >
                                    <span>LAPTOPS</span>
                                    <Image
                                        src="/images/07.webp"
                                        alt=""
                                        width={10}
                                        height={10}
                                    />
                                </a>

                                {/* Brands */}
                                <a 
                                    href="#brands" 
                                    className="w-full flex items-center justify-between py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-red rounded-lg transition-colors"
                                >
                                    <span>BRANDS</span>
                                    <Image
                                        src="/images/07.webp"
                                        alt=""
                                        width={10}
                                        height={10}
                                    />
                                </a>

                                {/* Deals */}
                                <a 
                                    href="#deals" 
                                    className="w-full flex items-center justify-between py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-red rounded-lg transition-colors"
                                >
                                    <span>DEALS</span>
                                    <Image
                                        src="/images/07.webp"
                                        alt=""
                                        width={10}
                                        height={10}
                                    />
                                </a>

                                {/* Accessories */}
                                <a 
                                    href="#accessories" 
                                    className="w-full flex items-center justify-between py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-red rounded-lg transition-colors"
                                >
                                    <span>ACCESSORIES</span>
                                    <Image
                                        src="/images/07.webp"
                                        alt=""
                                        width={10}
                                        height={10}
                                    />
                                </a>

                                {/* By Use */}
                                <a 
                                    href="#by-use" 
                                    className="w-full flex items-center justify-between py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-red rounded-lg transition-colors"
                                >
                                    <span>BY USE</span>
                                    <Image
                                        src="/images/07.webp"
                                        alt=""
                                        width={10}
                                        height={10}
                                    />
                                </a>

                                {/* Support */}
                                <a 
                                    href="#support" 
                                    className="w-full flex items-center justify-between py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-red rounded-lg transition-colors"
                                >
                                    <span>SUPPORT</span>
                                </a>
                            </div>

                            {/* Account Actions */}
                            <div className="space-y-1 py-4 border-b border-gray-200">
                                {/* ====== ENHANCED: Account / Sign In (Mobile) ====== */}
                                {status === 'authenticated' && session ? (
                                    <>
                                        {/* Logged-in user info */}
                                        <Link
                                            href="/account"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-red rounded-lg transition-colors"
                                        >
                                            {session.user.image ? (
                                                <Image
                                                    src={session.user.image}
                                                    alt={session.user.name || 'Profile'}
                                                    width={24}
                                                    height={24}
                                                    className="rounded-full border border-gray-300"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-brand-red flex items-center justify-center text-white font-bold text-[10px]">
                                                    {session.user.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                            )}
                                            <span>ACCOUNT</span>
                                        </Link>

                                        {/* Sign Out with confirmation */}
                                        {!mobileShowSignOut ? (
                                            <button
                                                onClick={() => setMobileShowSignOut(true)}
                                                className="flex items-center gap-3 py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors w-full"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                                    <polyline points="16 17 21 12 16 7" />
                                                    <line x1="21" y1="12" x2="9" y2="12" />
                                                </svg>
                                                <span>SIGN OUT</span>
                                            </button>
                                        ) : (
                                            <div className="mx-4 my-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                                                <p className="text-sm text-gray-700 mb-3">Are you sure you want to sign out?</p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="flex-1 py-2 text-sm font-bold text-white bg-brand-red rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        Yes, Sign Out
                                                    </button>
                                                    <button
                                                        onClick={() => setMobileShowSignOut(false)}
                                                        className="flex-1 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-red rounded-lg transition-colors"
                                    >
                                        <Image
                                            src="/images/04.webp"
                                            alt="Account"
                                            width={16}
                                            height={16}
                                        />
                                        <span>ACCOUNT / SIGN IN</span>
                                    </Link>
                                )}
                                {/* ====== END ENHANCED ====== */}

                                {/* Favorites */}
                                <a 
                                    href="#favorites" 
                                    className="flex items-center gap-3 py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-red rounded-lg transition-colors"
                                >
                                    <Image
                                        src="/images/05.webp"
                                        alt="Favorites"
                                        width={16}
                                        height={16}
                                    />
                                    <span>FAVORITES</span>
                                    <span className="ml-auto text-gray-500">(0)</span>
                                </a>

                                {/* Compare */}
                                <a 
                                    href="#compare" 
                                    className="flex items-center gap-3 py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-red rounded-lg transition-colors"
                                >
                                    <Image
                                        src="/images/06.webp"
                                        alt="Compare"
                                        width={16}
                                        height={16}
                                    />
                                    <span>COMPARE</span>
                                    <span className="ml-auto text-gray-500">(0)</span>
                                </a>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3 py-4 border-b border-gray-200">
                                <div className="flex items-center gap-2 px-4">
                                    <span className="text-sm font-bold text-gray-700">HOTLINE:</span>
                                    <a href="tel:+94112148400" className="text-sm text-brand-red hover:underline font-medium">
                                        +94 112 148 400
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 px-4">
                                    <span className="text-sm font-bold text-gray-700">EMAIL:</span>
                                    <a href="mailto:info@laptopoffers.lk" className="text-sm text-brand-red hover:underline font-medium">
                                        info@laptopoffers.lk
                                    </a>
                                </div>
                            </div>

                            {/* Secondary Links */}
                            <div className="space-y-1 py-4 border-b border-gray-200">
                                <a 
                                    href="#about" 
                                    className="block py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    ABOUT US
                                </a>
                                <a 
                                    href="#contact" 
                                    className="block py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    CONTACT US
                                </a>
                            </div>

                            {/* Social Media - Mobile */}
                            <div className="pt-4">
                                <p className="text-xs font-bold text-gray-500 mb-3 tracking-wider px-4">FOLLOW US</p>
                                <div className="flex items-center gap-2 px-4">
                                    <a
                                        href="#"
                                        className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center hover:bg-red-700 transition-all"
                                        aria-label="Facebook"
                                    >
                                        <Facebook size={18} fill="white" strokeWidth={0} />
                                    </a>
                                    <a
                                        href="#"
                                        className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center hover:bg-red-700 transition-all"
                                        aria-label="Twitter"
                                    >
                                        <Twitter size={18} fill="white" strokeWidth={0} />
                                    </a>
                                    <a
                                        href="#"
                                        className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center hover:bg-red-700 transition-all"
                                        aria-label="YouTube"
                                    >
                                        <svg width="16" height="14" viewBox="0 0 20 14" fill="white" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="20" height="14" rx="3" fill="white" />
                                            <path d="M8 10L14 7L8 4V10Z" fill="#E60000" />
                                        </svg>
                                    </a>
                                    <a
                                        href="#"
                                        className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center hover:bg-red-700 transition-all"
                                        aria-label="LinkedIn"
                                    >
                                        <Linkedin size={18} fill="white" strokeWidth={0} />
                                    </a>
                                </div>
                            </div>

                            {/* Cart Summary - Mobile Only */}
                            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 tracking-widest">CART TOTAL</div>
                                        <div className="text-lg font-bold text-gray-800 tracking-wide mt-1">LKR 200000.00</div>
                                    </div>
                                    <button className="px-5 py-2.5 bg-brand-red text-white text-sm font-bold rounded-full hover:bg-red-700 transition-colors">
                                        VIEW CART
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Bottom Navigation Header - Desktop Only */}
            <section ref={bottomNavRef} className="hidden lg:block bg-white lg:px-20">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between py-4">
                        {/* Left Side - All Categories Dropdown and Navigation */}
                        <div className="flex items-center gap-6">
                            {/* All Categories Dropdown */}
                            <button className="flex items-center gap-3 hover:text-brand-red transition-colors group">
                                <span className="text-[13px] font-bold text-gray-800 tracking-[0.2em] group-hover:text-brand-red transition-colors">
                                    ALL CATEGORIES
                                </span>
                                {/* Simple Triangle Caret */}
                                <svg 
                                    width="10" 
                                    height="6" 
                                    viewBox="0 0 10 6" 
                                    fill="none" 
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="group-hover:opacity-80 transition-opacity"
                                >
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>

                            {/* Vertical Divider */}
                            <div className="h-5 w-px bg-gray-300"></div>

                            {/* Navigation Menu */}
                            <nav className="flex items-center gap-6">
                                <a href="#laptops" className="flex items-center gap-2 text-[13px] font-bold text-gray-800 hover:text-brand-red transition-colors tracking-[0.08em] group">
                                    LAPTOPS
                                    <Image
                                        src="/images/07.webp"
                                        alt="Dropdown"
                                        width={10}
                                        height={10}
                                        className=" group-hover:opacity-100 transition-opacity"
                                    />
                                </a>
                                <a href="#brands" className="flex items-center gap-2 text-[13px] font-bold text-gray-800 hover:text-brand-red transition-colors tracking-[0.08em] group">
                                    BRANDS
                                    <Image
                                        src="/images/07.webp"
                                        alt="Dropdown"
                                        width={10}
                                        height={10}
                                        className="group-hover:opacity-100 transition-opacity"
                                    />
                                </a>
                                <a href="#deals" className="flex items-center gap-2 text-[13px] font-bold text-gray-800 hover:text-brand-red transition-colors tracking-[0.08em] group">
                                    DEALS
                                    <Image
                                        src="/images/07.webp"
                                        alt="Dropdown"
                                        width={10}
                                        height={10}
                                        className="group-hover:opacity-100 transition-opacity"
                                    />
                                </a>
                                <a href="#accessories" className="flex items-center gap-2 text-[13px] font-bold text-gray-800 hover:text-brand-red transition-colors tracking-[0.08em] group">
                                    ACCESSORIES
                                    <Image
                                        src="/images/07.webp"
                                        alt="Dropdown"
                                        width={10}
                                        height={10}
                                        className="group-hover:opacity-100 transition-opacity"
                                    />
                                </a>
                                <a href="#by-use" className="flex items-center gap-2 text-[13px] font-bold text-gray-800 hover:text-brand-red transition-colors tracking-[0.08em] group">
                                    BY USE
                                    <Image
                                        src="/images/07.webp"
                                        alt="Dropdown"
                                        width={10}
                                        height={10}
                                        className="group-hover:opacity-100 transition-opacity"
                                    />
                                </a>
                                 <a href="#by-use" className="flex items-center gap-2 text-[13px] font-bold text-gray-800 hover:text-brand-red transition-colors tracking-[0.08em] group">
                                    SUPPORT
                                    <Image
                                        src="/images/07.webp"
                                        alt="Dropdown"
                                        width={10}
                                        height={10}
                                        className="group-hover:opacity-100 transition-opacity"
                                    />
                                </a>
                            </nav>
                        </div>

                        {/* Right Side - Account, Favorites, Compare */}
                        <div className="flex items-center gap-6">
                            {/* ====== ENHANCED: Account / Sign In (Desktop) ====== */}
                            {status === 'authenticated' && session ? (
                                <>
                                    {/* ACCOUNT — shows profile pic, links to /account */}
                                    <Link
                                        href="/account"
                                        className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-brand-red transition-colors"
                                    >
                                        {session.user.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt={session.user.name || 'Profile'}
                                                width={28}
                                                height={28}
                                                className="rounded-full border-2 border-gray-300 object-cover"
                                            />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-brand-red flex items-center justify-center text-white font-bold text-[11px]">
                                                {session.user.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        <span className="tracking-wide">ACCOUNT</span>
                                    </Link>

                                    {/* SIGN OUT — with dropdown confirmation */}
                                    <div className="relative" ref={signOutRef}>
                                        <button
                                            onClick={() => setShowSignOutDropdown(!showSignOutDropdown)}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-brand-red transition-colors"
                                        >
                                            <span className="text-gray-400">|</span>
                                            <span className="tracking-wide">SIGN OUT</span>
                                            <ChevronDown
                                                size={10}
                                                className={`transition-transform duration-200 ${showSignOutDropdown ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {/* Sign Out Confirmation Dropdown */}
                                        {showSignOutDropdown && (
                                            <div className="absolute right-0 top-full mt-4 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50">
                                                {/* Arrow */}
                                                <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45" />

                                                <p className="text-sm text-gray-700 font-medium mb-1">
                                                    Sign out of your account?
                                                </p>
                                                <p className="text-xs text-gray-400 mb-4">
                                                    You can always sign back in anytime.
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="flex-1 py-2.5 text-sm font-bold text-white bg-brand-red rounded-xl hover:bg-red-700 transition-colors"
                                                    >
                                                        Yes, Sign Out
                                                    </button>
                                                    <button
                                                        onClick={() => setShowSignOutDropdown(false)}
                                                        className="flex-1 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-brand-red transition-colors"
                                >
                                    <Image
                                        src="/images/04.webp"
                                        alt="Account"
                                        width={12}
                                        height={12}
                                    />
                                    <span className="tracking-wide">ACCOUNT</span>
                                    <span className="text-gray-400">|</span>
                                    <span className="tracking-wide">SIGN IN</span>
                                </Link>
                            )}
                            {/* ====== END ENHANCED ====== */}

                            {/* Favorites */}
                            <a href="#favorites" className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-brand-red transition-colors">
                                <Image
                                    src="/images/05.webp"
                                    alt="Favorites"
                                    width={12}
                                    height={12}
                                />
                                <span className="tracking-wide">FAVORITES</span>
                                <span className="text-gray-500">(0)</span>
                            </a>

                            {/* Compare */}
                            <a href="#compare" className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-brand-red transition-colors">
                                <Image
                                    src="/images/06.webp"
                                    alt="Compare"
                                    width={12}
                                    height={12}
                                />
                                <span className="tracking-wide">COMPARE</span>
                                <span className="text-gray-500">(0)</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Header