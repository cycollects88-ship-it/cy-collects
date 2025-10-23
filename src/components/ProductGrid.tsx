import React, { useState, useEffect } from "react";
import { useProductContext, Product } from "../contexts/ProductContext";
import { useCategoryContext } from "../contexts/CategoryContext";
import { useCartContext } from "../contexts/CartContext";
import Toast from "./Toast";
import ProductDetailModal from "./ProductDetailModal";

interface ProductGridProps {
  initialCategory?: string;
  searchQuery?: string;
}

/**
 * ProductGrid component displaying inventory items
 * Features modern card design with add to cart functionality
 */
const ProductGrid: React.FC<ProductGridProps> = ({ initialCategory, searchQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "all");
  const { products, loading: productsLoading, searchProducts } = useProductContext();
  const { categories, loading: categoriesLoading } = useCategoryContext();
  const { addToCart } = useCartContext();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Update selected category when initialCategory prop changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  /**
   * Handle adding product to cart
   */
  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    const result = await addToCart(productId, 1);
    
    if (result.error) {
      setShowToast({ message: "Failed to add to cart. Please login first.", type: "error" });
    } else {
      setShowToast({ message: "Product added to cart!", type: "success" });
    }
    
    setAddingToCart(null);
  };

  /**
   * Handle product card click to show details
   */
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  /**
   * Handle closing the product detail modal
   */
  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  /**
   * Handle add to cart from modal
   */
  const handleAddToCartFromModal = async (productId: string) => {
    await handleAddToCart(productId);
    setSelectedProduct(null);
  };

  // Filter products by search query and category
  let filteredProducts = searchQuery ? searchProducts(searchQuery) : products;
  
  // Apply category filter if not "all"
  if (selectedCategory !== "all") {
    filteredProducts = filteredProducts.filter(product => product.category_id === selectedCategory);
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Newly Arrived!</h2>
            <p className="text-gray-600">Discover the latest additions to our collection</p>
          </div>
          <div className="text-sm text-gray-500 mt-4 sm:mt-0">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
          </div>
        </div>

        {/* Category Filter */}
        {!categoriesLoading && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedCategory === "all"
                  ? "bg-[#7D78A3] text-white"
                  : "bg-white text-gray-700 hover:bg-[#A29CBB]/10 border border-gray-200"
              }`}
            >
              All Products
            </button>
            {categories.filter(cat => cat.active).map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category.id
                    ? "bg-[#7D78A3] text-white"
                    : "bg-white text-gray-700 hover:bg-[#A29CBB]/10 border border-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {productsLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D78A3]"></div>
          </div>
        )}
        
        {!productsLoading && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        )}
        
        {!productsLoading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
              >
                {/* Product Image - Clickable */}
                <button 
                  type="button"
                  className="relative aspect-square overflow-hidden w-full"
                  onClick={() => handleProductClick(product)}
                  aria-label={`View details for ${product.name || "product"}`}
                >
                  {product.media_url_front ? (
                    <img
                      src={product.media_url_front}
                      alt={product.name || "Product"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {product.condition && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-[#7D78A3] text-white text-xs font-medium rounded-full">
                        {product.condition}
                      </span>
                    </div>
                  )}
                  {/* View Details Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center pointer-events-none">
                    <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      View Details
                    </span>
                  </div>
                </button>

                {/* Product Info */}
                <div className="p-4">
                  <button 
                    className="w-full text-left font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] hover:text-[#7D78A3] transition-colors"
                    onClick={() => handleProductClick(product)}
                  >
                    {product.name || "Unnamed Product"}
                  </button>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-[#7D78A3]">
                      BND ${(product.price || 0).toLocaleString()}
                    </span>
                  </div>

                  <button 
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addingToCart === product.id}
                    className="w-full bg-[#7D78A3] hover:bg-[#A29CBB] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToCart === product.id ? "Adding..." : "Add to Cart"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={showToast.message}
          type={showToast.type}
          onClose={() => setShowToast(null)}
        />
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCartFromModal}
          isAddingToCart={addingToCart === selectedProduct.id}
        />
      )}
    </section>
  );
};

export default ProductGrid;
