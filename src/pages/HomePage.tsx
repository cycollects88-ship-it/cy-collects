import React from "react";
import HeroBanner from "../components/HeroBanner";
import ProductGrid from "../components/ProductGrid";

/**
 * Home Page Component
 * Main landing page with hero banner and product grid
 */
const HomePage: React.FC = () => {
  return (
    <div>
      <HeroBanner />
      <ProductGrid />
    </div>
  );
};

export default HomePage;
