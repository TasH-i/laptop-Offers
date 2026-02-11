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

const BestLaptopDeals: React.FC = () => {
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
    <section className="relative w-[95%] mx-auto overflow-hidden py-2 md:py-8">
      {/* Main Hero Container  - desktop*/}
      <div 
        className="hidden lg:flex relative w-full h-full  lg:min-h-[480px] py-8 flex items-center overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: 'url(/images/15.webp)',
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
                <h1 className="text-4xl font-bold text-white leading-tight lg:min-w-5xl text-center lg:text-left">
                  Best Laptop Deals in Sri Lanka
                </h1>

                {/* Description */}
                <p className="text-gray-300 text-base lg:text-lg leading-relaxed text-justify lg:text-left">
                  Laptop Offers.lk brings you the most competitive laptop prices in Sri Lanka. 
                  From everyday study laptops to high-performance gaming machines, we help you 
                  choose smarter, faster, and with confidence.
                </p>

                {/* CTA Button */}
                <div className="pt-4 w-fit mx-auto lg:mx-0">
                       <Button href="/shop">SHOP LAPTOP DEALS</Button>
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
              <div className="space-y-8">
                
                {/* Top Text */}
                <div className="space-y-2">
                  <h2 className="text-2xl lg:text-3xl font-bold italic text-white leading-tight">
                    Top brands, latest models,
                  </h2>
                  <h3 className="text-2xl lg:text-3xl font-bold italic text-white leading-tight">
                    and unbeatable prices
                  </h3>
                  <p className="text-2xl italic">
                    <span className="text-2xl font-bold italic text-white leading-tight">all in one </span>
                    <span className="text-2xl font-bold italic text-pink-500 leading-tight">trusted marketplace.</span>
                  </p>
                </div>

                {/* Benefits Grid */}
                <div className="flex space-x-8">
                  {benefits.map((benefit, index) => (
                    <div
                      key={benefit.id}
                      className={`flex flex-col items-start gap- group transition-transform duration-300 cursor-pointer ${
                        index !== benefits.length - 1 ? 'pr-8 border-r border-gray-500' : ''
                      }`}
                    >
                      {/* Icon Container */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center transition-all duration-300">
                        <Image
                          src={benefit.icon}
                          alt={benefit.label}
                          width={40}
                          height={40}
                          className="w-full h-full p-2 object-contain"
                        />
                      </div>

                      {/* Text Content */}
                      <div className="flex-1 pt-1">
                        <p className="text-white text-sm italic">{benefit.label}</p>
                        <p className="text-white text-sm italic">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

       {/* Main Hero Container  - mobile/tab*/}
      <div 
        className="lg:hidden  relative w-full h-full  lg:min-h-[480px] py-8 flex items-center overflow-hidden bg-black"
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
                  Best Laptop Deals in Sri Lanka
                </h1>

                {/* Description */}
                <p className="text-gray-300 text-base lg:text-lg leading-relaxed text-justify lg:text-left">
                  Laptop Offers.lk brings you the most competitive laptop prices in Sri Lanka. 
                  From everyday study laptops to high-performance gaming machines, we help you 
                  choose smarter, faster, and with confidence.
                </p>

                {/* CTA Button */}
                <div className="pt-4 w-fit mx-auto lg:mx-0">
                       <Button href="/shop">SHOP LAPTOP DEALS</Button>
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
              <div className="space-y-8">
                
                {/* Top Text */}
                <div className="space-y-2">
                  <h2 className="text-2xl lg:text-3xl font-bold italic text-white leading-tight">
                    Top brands, latest models,
                  </h2>
                  <h3 className="text-2xl lg:text-3xl font-bold italic text-white leading-tight">
                    and unbeatable prices
                  </h3>
                  <p className="text-2xl italic">
                    <span className="text-2xl font-bold italic text-white leading-tight">all in one </span>
                    <span className="text-2xl font-bold italic text-pink-500 leading-tight">trusted marketplace.</span>
                  </p>
                </div>

                {/* Benefits Grid */}
                <div className="flex space-x-3 lg:space-x-8">
                  {benefits.map((benefit, index) => (
                    <div
                      key={benefit.id}
                      className={`flex flex-col items-start gap- group transition-transform duration-300 cursor-pointer ${
                        index !== benefits.length - 1 ? 'pr-8 border-r border-gray-500' : ''
                      }`}
                    >
                      {/* Icon Container */}
                      <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center transition-all duration-300">
                        <Image
                          src={benefit.icon}
                          alt={benefit.label}
                          width={40}
                          height={40}
                          className="w-full h-full p-2 object-contain"
                        />
                      </div>

                      {/* Text Content */}
                      <div className="flex-1 pt-1">
                        <p className="text-white text-sm italic">{benefit.label}</p>
                        <p className="text-white text-sm italic">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestLaptopDeals;