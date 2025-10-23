import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import HeroBanner from "../components/HeroBanner";
import ProductGrid from "../components/ProductGrid";

/**
 * Home Page Component
 * Main landing page with hero banner and product grid
 */
const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const searchQuery = searchParams.get("search");

  // Scroll to products when category or search is active
  useEffect(() => {
    if (categoryParam || searchQuery) {
      // Small delay to ensure page is rendered
      setTimeout(() => {
        const productsSection = document.querySelector("#products-section");
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [categoryParam, searchQuery]);

  return (
    <div>
      <HeroBanner />
      <div id="products-section">
        <ProductGrid 
          initialCategory={categoryParam || undefined}
          searchQuery={searchQuery || undefined}
        />
      </div>
    </div>
  );
};

export default HomePage;
