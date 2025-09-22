import React, { useState } from "react";

/**
 * Hero Banner component with promotional content and carousel
 * Features modern gradient design with brand colors
 */
const HeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const slides = [
    {
      id: 1,
      title: "New Release",
      subtitle: "August 1st Launch",
      description: "Latest trading card sets now available",
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&h=400&fit=crop",
      cta: "Shop Now",
    },
    {
      id: 2,
      title: "Mega Collection",
      subtitle: "Limited Time Offer",
      description: "Exclusive mega evolution cards",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
      cta: "Explore",
    },
    {
      id: 3,
      title: "Premium Sets",
      subtitle: "Collector's Choice",
      description: "Rare and valuable card collections",
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&h=400&fit=crop",
      cta: "View Collection",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative bg-[#7D78A3] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-white">
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                  {slides[currentSlide].subtitle}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {slides[currentSlide].title}
              </h1>
              
              <p className="text-xl text-white/90 mb-8 max-w-lg">
                {slides[currentSlide].description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white text-[#7D78A3] px-8 py-3 rounded-lg font-semibold hover:bg-[#A29CBB] hover:text-white transition-colors duration-200 shadow-lg">
                  {slides[currentSlide].cta}
                </button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#A29CBB] hover:border-[#A29CBB] transition-colors duration-200">
                  Learn More
                </button>
              </div>
            </div>

            {/* Image Content */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full backdrop-blur-sm"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm"></div>
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="relative z-10 mt-8 flex justify-center space-x-4">
            {/* Previous Button */}
            <button
              onClick={prevSlide}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Slide Indicators */}
            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    index === currentSlide ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
