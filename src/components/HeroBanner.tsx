import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProductContext } from "../contexts/ProductContext";
import { useServiceContext } from "../contexts/ServiceContext";

/**
 * Hero Banner component with promotional content and carousel
 * Features modern gradient design with brand colors
 */
const HeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const { products } = useProductContext();
  const { services } = useServiceContext();

  // Get latest product (most recently created)
  const latestProduct = useMemo(() => {
    if (products.length === 0) return null;
    return [...products].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
  }, [products]);

  // Get latest service
  const latestService = useMemo(() => {
    if (services.length === 0) return null;
    return [...services].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
  }, [services]);

  const slides = useMemo(() => [
    {
      id: 1,
      title: latestProduct?.name || "New Arrivals",
      subtitle: "Latest Pokemon Card",
      description: latestProduct ? `BND $${latestProduct.price?.toLocaleString()}` : "Discover the latest additions to our collection",
      image: latestProduct?.media_url_front || undefined,
      gradient: "from-purple-500 to-pink-500",
      cta: "Shop Now",
      link: "/",
    },
    {
      id: 2,
      title: latestService?.name || "Premium Services",
      subtitle: "Professional Card Services",
      description: latestService ? `BND $${latestService.price?.toLocaleString()}` : "Authentication, grading, and consultation services",
      image: latestService?.media_url || undefined,
      gradient: "from-blue-500 to-cyan-500",
      cta: "View Services",
      link: "/services",
    },
  ], [latestProduct, latestService]);

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
                <Link 
                  to={slides[currentSlide].link}
                  className="bg-white text-[#7D78A3] px-8 py-3 rounded-lg font-semibold hover:bg-[#A29CBB] hover:text-white transition-colors duration-200 shadow-lg text-center"
                >
                  {slides[currentSlide].cta}
                </Link>
                <Link
                  to="/want-to-buy"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#A29CBB] hover:border-[#A29CBB] transition-colors duration-200 text-center"
                >
                  Request a Card
                </Link>
              </div>
            </div>

            {/* Image Content */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {slides[currentSlide].image ? (
                  <div className="relative w-full h-80">
                    <img
                      src={slides[currentSlide].image}
                      alt={slides[currentSlide].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>
                ) : (
                  <div className={`w-full h-80 bg-gradient-to-br ${slides[currentSlide].gradient} flex items-center justify-center`}>
                    <div className="text-center text-white">
                      <svg className="w-32 h-32 mx-auto opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  </div>
                )}
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
              {slides.map((slide, index) => (
                <button
                  key={`slide-${slide.id}`}
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
