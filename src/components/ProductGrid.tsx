import React, { useState } from "react";

/**
 * Product interface for type safety
 */
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  condition: string;
  stock: number;
  category: string;
}

/**
 * ProductGrid component displaying inventory items
 * Features modern card design with stock indicators and add to cart functionality
 */
const ProductGrid: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Mock product data - in a real app, this would come from your database
  const products: Product[] = [
    {
      id: 1,
      name: "Magnemite LV.X DP5",
      description: "Condition A- Magnemite LV.X DP5 Unlimited Edition",
      price: 3480,
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop",
      condition: "A-",
      stock: 2,
      category: "rare",
    },
    {
      id: 2,
      name: "Pokemon Card Game Deck Shield",
      description: "New Pokemon Card Game Deck Shield Poliwag & Sunkern & Heracross & Chimecho",
      price: 1980,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop",
      condition: "New",
      stock: 1,
      category: "accessories",
    },
    {
      id: 3,
      name: "Premium Mat Collection",
      description: "New Pokemon Card Game Deck Shield Premium Mat Momowarou & Okidogi & Munkidori & Fezandipiti",
      price: 3980,
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop",
      condition: "New",
      stock: 1,
      category: "accessories",
    },
    {
      id: 4,
      name: "Koraidon Slate Deck Shield",
      description: "New Pokemon Card Game Deck Shield Overseas Edition Koraidon Slate",
      price: 1980,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop",
      condition: "New",
      stock: 1,
      category: "accessories",
    },
    {
      id: 5,
      name: "Evolution Path Cinderace",
      description: "New Pokemon Card Game Deck Shield Evolution Path Cinderace",
      price: 1280,
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop",
      condition: "New",
      stock: 1,
      category: "accessories",
    },
    {
      id: 6,
      name: "Cynthia's Garchomp ex",
      description: "Condition B+ Cynthia's Garchomp ex SAR SV9a 087/063 [KK]",
      price: 22800,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop",
      condition: "B+",
      stock: 1,
      category: "rare",
    },
    {
      id: 7,
      name: "Charizard VMAX",
      description: "Shiny Charizard VMAX from Darkness Ablaze",
      price: 15800,
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop",
      condition: "A",
      stock: 3,
      category: "rare",
    },
    {
      id: 8,
      name: "Booster Pack Set",
      description: "Sword & Shield Base Set Booster Pack (10 Pack Bundle)",
      price: 4500,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop",
      condition: "New",
      stock: 5,
      category: "packs",
    },
  ];

  const categories = [
    { value: "all", label: "All Products" },
    { value: "rare", label: "Rare Cards" },
    { value: "accessories", label: "Accessories" },
    { value: "packs", label: "Booster Packs" },
  ];

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const getStockColor = (stock: number) => {
    if (stock > 3) return "text-green-600 bg-green-100";
    if (stock > 1) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getStockText = (stock: number) => {
    if (stock > 3) return `${stock} in stock`;
    if (stock > 1) return `Only ${stock} left`;
    return "Only 1 remaining";
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Newly Arrived!</h2>
            <p className="text-gray-600">Discover the latest additions to our collection</p>
          </div>
          <a
            href="#"
            className="inline-flex items-center text-[#7D78A3] hover:text-[#A29CBB] font-medium transition-colors duration-200 mt-4 sm:mt-0"
          >
            View All Products
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedCategory === category.value
                  ? "bg-[#7D78A3] text-white"
                  : "bg-white text-gray-700 hover:bg-[#A29CBB]/10 border border-gray-200"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-[#7D78A3] text-white text-xs font-medium rounded-full">
                    {product.condition}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockColor(product.stock)}`}>
                    {getStockText(product.stock)}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-[#7D78A3]">
                    ¥{product.price.toLocaleString()}
                  </span>
                </div>

                <button className="w-full bg-[#7D78A3] hover:bg-[#A29CBB] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-white border-2 border-[#7D78A3] text-[#7D78A3] hover:bg-[#7D78A3] hover:text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200">
            Load More Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
