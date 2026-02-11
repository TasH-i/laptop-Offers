// components/Layout/Footer.tsx
'use client'
import React from 'react'
import { Facebook, Twitter, Youtube, Linkedin } from 'lucide-react'
import Image from 'next/image'

const Footer = () => {
    return (
        <footer className="bg-linear-to-b from-[#464545] to-black text-white">
            {/* Main Footer Content */}
            <section className="px-6 lg:px-20 py-12 lg:py-16">
                <div className="container mx-auto px-4">
                    <div className="md:grid grid-row-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                        {/* Column 1 - Logo and Contact */}
                        <div className="space-y-6  ">
                            {/* Logo */}
                            <div className="h-12 lg:w-68 relative">
                                <Image
                                    src="/images/01.webp"
                                    alt="LaptopOffers.lk"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>

                            {/* Address */}
                            <div className="text-gray-300 text-md leading-relaxed">
                                <p>NO. Lorem Ipsum Dolor, Sitamate,</p>
                                <p>Colombo 00.</p>
                            </div>

                            {/* Phone */}
                            <div className="text-gray-300 text-md">
                                <p>Phone: <a href="tel:+94123456789" className="hover:text-brand-red transition-colors">+94 123 456 789</a></p>
                            </div>

                            {/* Social Media Icons */}
                            <div className="flex items-center gap-3 md:gap-0 lg:gap-3">
                                <a
                                    href="#"
                                    className="w-12 h-12 rounded-full border-2 border-white/20 hover:border-brand-red flex items-center justify-center transition-all group"
                                    aria-label="Facebook"
                                >
                                    <Facebook size={18} fill="white" strokeWidth={0} className='hover:scale-115 transition-transform duration-500' />
                                </a>
                                <a
                                    href="#"
                                    className="w-12 h-12 rounded-full border-2 border-white/20 hover:border-brand-red flex items-center justify-center transition-all group"
                                    aria-label="Twitter"
                                >
                                    <Twitter size={18} fill="white" strokeWidth={0} className='hover:scale-115 transition-transform duration-500' />
                                </a>
                                <a
                                    href="#"
                                    className="w-12 h-12 rounded-full border-2 border-white/20 hover:border-brand-red flex items-center justify-center transition-all group"
                                    aria-label="YouTube"
                                >
                                    {/* YouTube Play Button Icon */}
                                    <svg width="16" height="14" viewBox="0 0 20 14" fill="white" xmlns="http://www.w3.org/2000/svg" className='hover:scale-115 transition-transform duration-700'>
                                        <rect width="20" height="14" rx="3" fill="white" />
                                        <path d="M8 10L14 7L8 4V10Z" fill="black" />
                                    </svg>                                </a>
                                <a
                                    href="#"
                                    className="w-12 h-12 rounded-full border-2 border-white/20 hover:border-brand-red flex items-center justify-center transition-all group"
                                    aria-label="LinkedIn"
                                >
                                    <Linkedin size={18} fill="white" strokeWidth={0} className='hover:scale-115 transition-transform duration-500' />
                                </a>
                            </div>

                            {/* More Information */}
                            <div className="text-md">
                                <span className="text-gray-400">More Information: </span>
                                <a href="mailto:sales@laptopcare.lk" className="text-brand-red hover:underline">
                                    sales@laptopcare.lk
                                </a>
                            </div>
                        </div>

                        {/* Column 2 - Quick Links */}
                        <div className='lg:pl-16 mt-12 md:mt-0'>
                            <h3 className="text-white font-bold text-base mb-6 tracking-wide">QUICK LINKS</h3>
                            <ul className="space-y-3">
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                                        Laptop Deals
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                                        Brands
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                                        Contact Us
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3 - Top Links */}
                        <div>
                            <h3 className="text-white font-bold text-base mb-6 tracking-wide mt-12 md:mt-0">TOP LINKS</h3>
                            <ul className="space-y-3">
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                                        Accessories & Upgrades
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                                        Customer Support
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                                        Delivery Information
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                                        Warranty Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                                        FAQs
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Column 4 - Account */}
                        <div>
                            <h3 className="text-white font-bold text-base mb-6 tracking-wide mt-12 md:mt-0">ACCOUNT</h3>
                            <ul className="space-y-3">
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                                        My Account
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                                        Order History
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                                        Track Order
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                                        Wish List
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Payment Methods */}
                        <div className="mt-12 md:-mt-12 flex items-center justify-end col-span-4 ">
                            <div className="flex items-center gap-3 flex-wrap">
                                {/* Bank Icon */}
                                <div className="bg-white rounded px-2 py-1.5 flex items-center justify-center">
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M3 21H21M3 7L12 2L21 7V9H3V7Z" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M5 9V18M9 9V18M15 9V18M19 9V18" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>

                                {/* UPI */}
                                <div className="bg-white rounded px-3 py-1.5">
                                    <span className="text-black font-bold text-sm italic">UPI</span>
                                </div>

                                {/* Visa */}
                                <div className="bg-white rounded px-3 py-1.5">
                                    <span className="text-[#1434CB] font-bold text-base italic">VISA</span>
                                </div>

                                {/* RuPay */}
                                <div className="bg-white rounded px-3 py-1.5">
                                    <span className="text-black font-bold text-sm">RuPay</span>
                                </div>

                                {/* Mastercard */}
                                <div className="bg-white rounded px-2 py-1.5 flex items-center gap-1">
                                    <div className="w-6 h-6 rounded-full bg-[#EB001B]"></div>
                                    <div className="w-6 h-6 rounded-full bg-[#F79E1B] -ml-3"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom Footer - Copyright */}
            <section className="lg:px-20 lg:pb-16">
                <div className="border-t-2 border-white/10 container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm py-6">
                        <div className="text-white">
                            © {new Date().getFullYear()} LaptopOffers, All Rights Reserved
                        </div>
                        <div className="text-white text-sm">
                            Design and Developed by <span className="text-white font-bold cursor-pointer text-[16px] hover:text-orange-400"><a href='https://cloudedesign.com/'  target="_blank"  rel="noopener noreferrer" >Claude Design</a></span>
                        </div>
                    </div>
                </div>
            </section>
        </footer>
    )
}

export default Footer