"use client"
import { useState, useEffect } from "react";
import LargeHeroCard from "./LargeHeroCard";
import SmallHeroCard from "./SmallHeroCard";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: number;
  image: string;
  alt: string;
  brand?: string;
  title: string;
  subtitle: string;
  description?: string;
  badge?: {
    text: string;
    position: "top-right" | "top-left";
  };
  specs?: string[];
  tagline?: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: "/images/09.webp",
    alt: "Lenovo IdeaPad Slim 3",
    brand: "Lenovo",
    title: "Lenovo IDEAPAD",
    subtitle: "SLIM 3",
    description: "A budget-friendly, portable laptop for daily use not for heavy gaming or high-end work.",
    badge: { text: "50% OFF Limited", position: "top-right" },
    specs: [
      "INTEL CORE I7\n13620H PROCESSOR",
      "16GB MEMORY\nDDR5 5200MHZ",
      "512GB SSD\nNVME 4.0 DRIVE",
      "15.6 FHD DISPLAY\nANTIGLARE IPS 1920X1080",
    ],
    tagline: undefined,
  },
  {
    id: 2,
    image: "/images/10.webp",
    alt: "Wireless Freedom",
    title: "Wireless",
    subtitle: "Freedom",
    description: "Experience Sound Like Never Before",
    badge: { text: "50%", position: "top-right" },
    tagline: "Listen in Comfort",
  },
  {
    id: 3,
    image: "/images/11.webp",
    alt: "Gaming Graphics Card",
    brand: "ASUS DUAL RTX 3050 OC EDITION 6GB",
    title: "Gaming",
    subtitle: "GRAPHICS CARD",
    description: "Smooth Graphics, Better Gaming",
    badge: { text: "UP TO 50% OFF", position: "top-left" },
    tagline: "OFFER PRICE ₹21,500",
  },
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get large hero (current slide)
  const largeHero = slides[currentIndex];

  // Get small heroes (next two slides)
  const smallHero1 = slides[(currentIndex + 1) % slides.length];
  const smallHero2 = slides[(currentIndex + 2) % slides.length];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <>
      {/* DESKTOP LAYOUT - lg breakpoint and up (Unchanged) */}
      <div className="hidden lg:flex w-[95%] mx-auto gap-6">
        {/* Large Hero - Left 2/3 */}
        <div className="w-2/3 relative">
          <LargeHeroCard slide={largeHero} isMobile={false} />
          {/* Navigation Controls */}
          <div className="absolute bottom-8 right-18 flex items-center gap-4 z-10">
            <button
              onClick={prevSlide}
              className="p-3 rounded-full hover:scale-125 transition-transform duration-300"
              aria-label="Previous slide"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <p className="text-white text-sm flex my-auto justify-center items-center gap-">
              <span className="font-bold text-xl "> {String(currentIndex + 1).padStart(2, "0")} /</span> <span> {String(slides.length).padStart(2, "0")} </span>
            </p>
            <button
              onClick={nextSlide}
              className="p-4 rounded-full border-2 border-white hover:scale-110 transition-all duration-500"
              aria-label="Next slide"
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Small Heroes - Right 1/3 */}
        <div className="w-1/3 flex flex-col gap-5">
          <SmallHeroCard slide={smallHero1} position="top" isMobile={false} />
          <SmallHeroCard slide={smallHero2} position="bottom" isMobile={false} />
        </div>
      </div>

      {/* TABLET & MOBILE LAYOUT - Below lg breakpoint (Responsive) */}
      <div className="lg:hidden w-full ">
        <div className="w-[95%] mx-auto flex flex-col gap-4 md:gap-6">
          {/* Large Hero - Full Width */}
          <div className="relative w-full">
            <LargeHeroCard slide={largeHero} isMobile={true} />
            {/* Navigation Controls - Mobile/Tablet */}
            <div className="absolute bottom-1.5 md:bottom-6 right-4 md:right-6 flex items-center gap-2 md:gap-4 z-10">
              <button
                onClick={prevSlide}
                className="p-2 md:p-3 rounded-full hover:scale-125 transition-transform duration-300"
                aria-label="Previous slide"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </button>
              <p className="text-white text-xs md:text-sm flex my-auto justify-center items-center">
                <span className="font-bold text-base md:text-xl"> {String(currentIndex + 1).padStart(2, "0")} /</span> <span> {String(slides.length).padStart(2, "0")} </span>
              </p>
              <button
                onClick={nextSlide}
                className="p-2 md:p-3 rounded-full border-2 border-white hover:scale-110 transition-all duration-500"
                aria-label="Next slide"
              >
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Small Heroes - Full Width Stacked */}
          <div className="flex flex-col gap-4 md:gap-5">
            <SmallHeroCard slide={smallHero1} position="top" isMobile={true} />
            <SmallHeroCard slide={smallHero2} position="bottom" isMobile={true} />
          </div>
        </div>
      </div>
    </>
  );
}