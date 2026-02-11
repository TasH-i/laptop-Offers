'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '../ui/button';

interface BenefitItem {
    id: number;
    icon: string;
    label: string;
    description: string;
}

const BuildForSpeed: React.FC = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const benefits: BenefitItem[] = [
        {
            id: 1,
            icon: '/images/12.webp',
            label: 'Genuine',
            description: 'Products',
        },
        {
            id: 2,
            icon: '/images/13.webp',
            label: 'Islandwide',
            description: 'Delivery',
        },
        {
            id: 3,
            icon: '/images/14.webp',
            label: 'Warranty and',
            description: 'After-Sales Support',
        },
    ];

    return (
        <section className="relative w-[95%] mx-auto overflow-hidden">
            {/* Main Hero Container  - desktop*/}
            <div
                className="hidden lg:flex relative w-full h-full  lg:min-h-[640px] py-8 flex items-center overflow-hidden bg-cover bg-center"
                style={{
                    backgroundImage: 'url(/images/41.webp)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: "no-repeat",
                }}
            >

                {/* Content Container */}
                <div className="relative z-10 w-full max-w-[95%] mx-auto  px-6 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 items-center">

                        {/* Left Section - Text Content */}
                        <div className={`lg:col-span-1 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                            <div className="space-y-6 ">
                                {/* Main Heading */}
                                <h1 className="text-[40px] pb-2 font-bold text-white leading-tight lg:min-w-5xl text-center lg:text-left">
                                    Built for Speed. <br />
                                    Designedfor Power.
                                </h1>

                                {/* Description */}
                                <p className="text-gray-200  text-base lg:text-lg leading-relaxed text-justify lg:text-left">
                                    Whether you're editing videos, attending online classes, coding
                                    or gaming late into the night, Laptop Offers.lk helps you find
                                    laptops that deliver the right level of performance without
                                    paying for power you don't need.
                                </p>

                                {/* CTA Button */}
                                <div className="pt-10 w-fit mx-auto lg:mx-0">
                                    <Button href="/shop">EXPLORE PERFORMANCE LAPTOPS</Button>
                                </div>
                            </div>
                        </div>

                        {/* Center Section - Product Image */}
                        <div className={`lg:col-span-1 flex justify-center items-center transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                            <div className="relative w-full max-w-sm aspect-auto">
                                {/* <Image
                  src="/images/15.webp"
                  alt="Premium Laptop"
                  width={500}
                  height={400}
                  priority
                  className="w-full h-auto object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                /> */}
                            </div>
                        </div>

                        {/* Right Section - Benefits */}
                        <div className={`lg:col-span-1 transition-all lg:ml-14 duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>

                        </div>
                    </div>
                </div>
            </div>

            {/* Main Hero Container  - mobile/tab*/}
            <div
                className="lg:hidden  relative w-full h-full  lg:min-h-[480px] py-8 flex items-center overflow-hidden bg-[#441d6c]"
            // style={{
            //   backgroundImage: 'url(/images/15.webp)',
            //   backgroundSize: 'cover',
            //   backgroundPosition: 'center',
            //   backgroundRepeat: "no-repeat",
            // }}
            >

                {/* Content Container */}
                <div className="relative z-10 w-full max-w-[95%] mx-auto  px-6 py-6 md:py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 items-center">

                        {/* Left Section - Text Content */}
                        <div className={`lg:col-span-1 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                            <div className="space-y-6 ">
                                {/* Main Heading */}
                                <h1 className="text-4xl font-bold text-white leading-tight lg:min-w-5xl text-center lg:text-left">
                                    Built for Speed. <br />
                                    Designedfor Power.
                                </h1>

                                {/* Description */}
                                <p className="text-gray-300 text-base lg:text-lg leading-relaxed text-justify lg:text-left">
                                    Whether you're editing videos, attending online classes, coding,
                                    or gaming late into the night, Laptop Offers,lk helps you find
                                    laptops that deliver the right level of performance—without
                                    paying for power you don't need.
                                </p>

                                {/* CTA Button */}
                                <div className="pt-4 w-fit mx-auto lg:mx-0">
                                    <Button href="/shop">EXPLORE PERFORMANCE LAPTOPS</Button>
                                </div>
                            </div>
                        </div>

                       </div>
                </div>
            </div>
        </section>
    );
};

export default BuildForSpeed;