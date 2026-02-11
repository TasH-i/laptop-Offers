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

interface SmallHeroCardProps {
    slide: Slide;
    position: "top" | "bottom";
    isMobile?: boolean;
}

export default function SmallHeroCard({ slide, position, isMobile = false }: SmallHeroCardProps) {
    // Determine gradient based on slide
    let bgGradient = "from-green-500 to-green-700";
    if (slide.id === 3) {
        bgGradient = "from-blue-600 to-blue-900";
    } else if (slide.id === 1) {
        bgGradient = "from-purple-600 to-purple-900";
    }

    if (isMobile) {
        // Mobile/Tablet responsive version
        return (
            <div
                className={`hidden relative w-full bg-gradient-to-br ${bgGradient} overflow-hidden flex justify-between min-h-[200px] md:min-h-[280px] border-b border-gray-800`}
                style={{
                    backgroundImage: `url(${slide.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                {/* Shop Now Button - Mobile */}
                <div className="absolute bottom-3 left-4 md:bottom-4 md:left-6 z-10">
                    <Button scrollTo="contact">Shop Now</Button>
                </div>
            </div>
        );
    }

    // Desktop version - Unchanged
    return (
        <div
            className={`relative w-auto h-[320px] bg-gradient-to-br ${bgGradient} overflow-hidden flex flex-col justify-between border-b border-gray-800`}
            style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Shop Now Button */}
            <div className="absolute bottom-4 left-12 z-10">
                <Button scrollTo="contact">Shop Now</Button>
            </div>
        </div>
    );
}