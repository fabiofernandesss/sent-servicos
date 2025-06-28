
import { useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const BannerCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const banners = [
    '/lovable-uploads/7708f9a7-e71b-43ed-92d3-47e406844c69.png',
    '/lovable-uploads/c2035101-e755-463d-826a-62f814bcba05.png'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="relative overflow-hidden">
      <AspectRatio ratio={3/1} className="w-full">
        <div 
          className="flex transition-transform duration-500 ease-in-out w-full h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <img
              key={index}
              src={banner}
              alt={`Banner ${index + 1}`}
              className="w-full h-full object-cover flex-shrink-0"
            />
          ))}
        </div>
      </AspectRatio>
      
      {/* Indicadores - menores */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentSlide === index ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
