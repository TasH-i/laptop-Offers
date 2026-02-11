// components/ui/button.tsx

"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useCallback } from "react";

interface ButtonProps {
  href?: string;
  scrollTo?: string;
  children: React.ReactNode;
  className?: string;
  textSize?: string; // e.g., "text-xs", "text-2xl", "text-sm md:text-base"
}

export default function Button({ href, scrollTo, children, className, textSize }: ButtonProps) {
  const defaultTextSize = "text-sm md:text-lg";

  const handleSectionScroll = useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (!scrollTo) return;
    e.preventDefault();
    const sectionId = scrollTo.startsWith("#") ? scrollTo.substring(1) : scrollTo;
    const section = document.getElementById(sectionId);
    if (section) {
      const headerHeight = 55;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const targetScroll = sectionTop - headerHeight;
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  }, [scrollTo]);

  const baseClasses = cn(
    "flex px-3 md:px-6 py-2 md:py-3 gap-4 cursor-pointer bg-brand-red text-white rounded-full transition-all duration-300 font-semibold glitter-button border-none",
    textSize || defaultTextSize,
    className
  );

  const glitterStyles = `
    @keyframes glitterMove {
      0% { background-position: 0% 0%; }
      100% { background-position: 100% 0%; }
    }
    .glitter-button {
      position: relative;
      background-clip: padding-box;
    }
    .glitter-button::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 9999px;
      padding: 2px;
      background: conic-gradient(from 0deg at 50% 50%, rgba(255, 255, 255, 0.8) 0deg, rgba(255, 255, 255, 0.2) 90deg, transparent 180deg);
      background-size: 200% 200%;
      animation: glitterMove 1.5s linear infinite;
      animation-delay: 3s;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
      z-index: 0;
    }
    .glitter-button > * {
      position: relative;
      z-index: 1;
    }
  `;

  if (scrollTo) {
    return (
      <>
        <style>{glitterStyles}</style>
        <button onClick={handleSectionScroll} className={baseClasses}>
          {children}
          <img src="/images/08.webp" alt="Previous" className="w-4 h-4 my-auto" />
        </button>
      </>
    );
  }

  return (
    <>
      <style>{glitterStyles}</style>
      <Link href={href || "/"} className={baseClasses}>
        {children}
        <img src="/images/08.webp" alt="Previous" className="w-4 h-4 my-auto" />
      </Link>
    </>
  );
}