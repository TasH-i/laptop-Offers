import Button from "../ui/button";

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

interface LargeHeroCardProps {
    slide: Slide;
    isMobile?: boolean;
}

export default function LargeHeroCard({ slide, isMobile = false }: LargeHeroCardProps) {
    const bgColor = slide.id === 1 ? "from-purple-600 to-purple-900" : "from-gray-900 to-gray-800";

    if (isMobile) {
        // Mobile/Tablet responsive version
        return (
            <div
                className={`relative w-full bg-gradient-to-br ${bgColor} overflow-hidden flex items-center justify-between min-h-[240px] md:min-h-[420px]`}
                style={{
                    backgroundImage: `url(${slide.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                {/* Shop Now Button - Mobile */}
                <div className="absolute bottom-15 left-6 md:bottom-26 md:left-28 z-10">
                    <Button scrollTo="contact">Shop Now</Button>
                </div>
            </div>
        );
    }

    // Desktop version - Unchanged
    return (
        <div
            className={`relative w-full h-full min-h-[664px] bg-gradient-to-br ${bgColor} overflow-hidden flex items-center justify-between`}
            style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Shop Now Button */}
            <div className="absolute bottom-1/3 left-42 z-10">
                <Button scrollTo="contact">Shop Now</Button>
            </div>
        </div>
    );
}