"use client";

import { useState } from "react";
import Button from "../ui/button";
import ReviewCard from "../ui/ReviewCard";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function TestimonialsSection() {
    const reviews = [
        {
            image: "/images/42.webp",
            name: "Office Professional 1",
            location: "Nimesh P, Colombo 1",
           review:
                "I needed a reliable laptop for office work, and their team helped me choose the perfect one. Great service and genuine products",
            rating: 4,
        },
        {
            image: "/images/43.webp",
            name: "Office Professional",
            location: "Nimesh P, Colombo",
            review:
                "I needed a reliable laptop for office work, and their team helped me choose the perfect one. Great service and genuine products",
            rating: 5,
        },
        {
            image: "/images/43.webp",
            name: "Office Professional 3",
            location: "Nimesh P, Colombo 3",
           review:
                "I needed a reliable laptop for office work, and their team helped me choose the perfect one. Great service and genuine products",
            rating: 5,
        },
        {
            image: "/images/42.webp",
            name: "Office Professional 4",
            location: "Nimesh P, Colombo 4",
            review:
                "I needed a reliable laptop for office work, and their team helped me choose the perfect one. Great service and genuine products",
            rating: 5,
        },
        {
            image: "/images/43.webp",
            name: "Office Professional 5",
            location: "Nimesh P, Colombo 5",
            review:
                "I needed a reliable laptop for office work, and their team helped me choose the perfect one. Great service and genuine products",
            rating: 5,
        },
        {
            image: "/images/42.webp",
            name: "Office Professional 6",
            location: "Nimesh P, Colombo 6",
            review:
                "I needed a reliable laptop for office work, and their team helped me choose the perfect one. Great service and genuine products",
            rating: 5,
        },
    ];

    const [currentSlide, setCurrentSlide] = useState(0);
    const itemsPerSlide = 3;
    const totalSlides = reviews.length - itemsPerSlide + 1;
    const canScrollLeft = currentSlide > 0;
    const canScrollRight = currentSlide < totalSlides - 1;

    // Mobile state
    const [currentMobileSlide, setCurrentMobileSlide] = useState(0);

    const nextSlide = () => {
        if (canScrollRight) {
            setCurrentSlide((prev) => prev + 1);
        }
    };

    const prevSlide = () => {
        if (canScrollLeft) {
            setCurrentSlide((prev) => prev - 1);
        }
    };

    const canMobileScrollLeft = currentMobileSlide > 0;
    const canMobileScrollRight = currentMobileSlide < reviews.length - 1;

    const nextMobileSlide = () => {
        if (canMobileScrollRight) {
            setCurrentMobileSlide((prev) => prev + 1);
        }
    };

    const prevMobileSlide = () => {
        if (canMobileScrollLeft) {
            setCurrentMobileSlide((prev) => prev - 1);
        }
    };

    return (
        <section className="bg-white py-12 md:py-20 px-6 md:px-12 text-center text-white">
            <div className="max-w-screen">
                {/* Heading */}
                <p className="text-gray-800 font-medium mb-3"> Testimonials</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-black">
                    What Our Customers Say
                </h2>
                <p className="flex text-slate-800 max-w-2xl mx-auto">
                    Real experiences from customers who trust Laptop Offers.lk for their laptop needs.
                </p>

                <div className="flex justify-self-end mb-8 mt-6 lg:-mt-6">
                    <span className="text-black underline cursor-pointer hover:text-brand-red">View More Reviews</span>
                </div>

                {/* ======================== MOBILE VIEW ======================== */}
                <div className="md:hidden">
                    {/* Mobile Review Carousel - Single Item */}
                    <div className="relative overflow-hidden mb-8">
                        <div 
                            className="flex transition-transform duration-500 ease-out"
                            style={{
                                transform: `translateX(-${currentMobileSlide * 100}%)`,
                            }}
                        >
                            {reviews.map((review, index) => (
                                <div key={index} className="shrink-0 w-full">
                                    <ReviewCard {...review} />
                                </div>
                            ))}
                        </div>
                    </div>

                    
                </div>

                {/* ======================== TABLET & DESKTOP VIEW ======================== */}
                <div className="hidden md:block">
                    {/* Review Carousel */}
                    <div className="relative overflow-hidden">
                        <div 
                            className="flex gap-6 md:gap-8 transition-transform duration-500 ease-out"
                            style={{
                                transform: `translateX(-${currentSlide * (100 / itemsPerSlide)}%)`,
                            }}
                        >
                            {reviews.map((review, index) => (
                                <div key={index} className="shrink-0 w-1/3">
                                    <ReviewCard {...review} />
                                </div>
                            ))}
                        </div>
                    </div>

                   
                </div>

                {/* Navigation Buttons - Mobile */}
                <div className="flex gap-3 justify-center items-center mt-8 mb-4 md:hidden">
                    <button
                        onClick={prevMobileSlide}
                        disabled={!canMobileScrollLeft}
                        className={`p-2 rounded-full border-2 transition-all duration-300 ${canMobileScrollLeft
                            ? 'border-gray-800  text-gray-800 cursor-pointer'
                            : 'border-black/30 text-black/30 cursor-not-allowed'
                            }`}
                        aria-label="Scroll left"
                    >
                        <ArrowLeft size={24} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={nextMobileSlide}
                        disabled={!canMobileScrollRight}
                        className={`p-4 rounded-full border-2 transition-all duration-300 ${canMobileScrollRight
                            ? 'border-gray-800  text-gray-800 cursor-pointer'
                            : 'border-black/30 text-black/30 cursor-not-allowed'
                            }`}
                        aria-label="Scroll right"
                    >
                        <ArrowRight size={24} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Navigation Buttons - Desktop */}
                <div className="hidden md:flex gap-3 justify-center items-center mt-12 mb-4">
                    <button
                        onClick={prevSlide}
                        disabled={!canScrollLeft}
                        className={`p-2 rounded-full border-2 transition-all duration-300 ${canScrollLeft
                            ? 'border-gray-800  text-gray-800 cursor-pointer'
                            : 'border-black/30 text-black/30 cursor-not-allowed'
                            }`}
                        aria-label="Scroll left"
                    >
                        <ArrowLeft size={24} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={nextSlide}
                        disabled={!canScrollRight}
                        className={`p-4 rounded-full border-2 transition-all duration-300 ${canScrollRight
                            ? 'border-gray-800  text-gray-800 cursor-pointer'
                            : 'border-black/30 text-black/30 cursor-not-allowed'
                            }`}
                        aria-label="Scroll right"
                    >
                        <ArrowRight size={24} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </section>
    );
}