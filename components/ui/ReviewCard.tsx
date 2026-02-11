import Image from "next/image";

interface ReviewCardProps {
  image: string;
  name: string;
  location: string;
  review: string;
  rating: number;
}

export default function ReviewCard({
  image,
  name,
  location,
  review,
  rating,
}: ReviewCardProps) {
  return (
    <div className="bg-[#f3f3f3] border border-gray-400 rounded-2xl p-6 md:p-8 flex flex-col items-center text-center space-y-3 md:space-y-2  transition-colors duration-300 md:min-w-1/3 md:h-[480px] lg:h-[360px] min-h-[420px] md:min-h-auto">
      {/* Profile Image */}
      <div className="w-12 h-12 md:w-18 md:h-18 rounded-full overflow-hidden shrink-0">
        <Image
          src={image}
          alt={name}
          width={56}
          height={56}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Location */}
      <p className="text-gray-600 text-xs md:text-base shrink-0 mt-6">{location}</p>

      {/* Name */}
      <span className="text-base md:text-2xl font-semibold text-black shrink-0 tracking-wide">{name}</span>

      {/* Review Text */}
      <p className="text-gray-700 text-xs md:text-sm leading-relaxed grow">{review}</p>

      {/* Rating */}
      <div className="flex justify-center space-x-1 shrink-0">
        {[...Array(rating)].map((_, i) => (
          <span key={i} className="text-yellow-400 text-base md:text-lg">★</span>
        ))}
      </div>
    </div>
  );
}