import React from "react";
import { Product } from "../contexts/ProductContext";

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (productId: string) => void;
  isAddingToCart: boolean;
}

/**
 * ProductDetailModal component
 * Displays detailed information about a product in a modal
 */
const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isAddingToCart,
}) => {
  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-label="Close modal"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image Section */}
              <div className="space-y-4">
                {/* Front Image */}
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {product.media_url_front ? (
                    <img
                      src={product.media_url_front}
                      alt={`${product.name || "Product"} - Front`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Back Image (if available) */}
                {product.media_url_back && (
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={product.media_url_back}
                      alt={`${product.name || "Product"} - Back`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="space-y-6">
                {/* Title and Condition */}
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.name || "Unnamed Product"}
                  </h3>
                  {product.condition && (
                    <span className="inline-block px-3 py-1 bg-[#7D78A3] text-white text-sm font-medium rounded-full">
                      {product.condition}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="border-t border-b border-gray-200 py-4">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold text-[#7D78A3]">
                      BND ${(product.price || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Product Details Grid */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Product Information</h4>
                  
                  {product.created_at && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Added</span>
                      <span className="font-medium text-gray-900">
                        {new Date(product.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Add to Cart Button */}
                <div className="pt-4">
                  <button
                    onClick={() => onAddToCart(product.id)}
                    disabled={isAddingToCart}
                    className="w-full bg-[#7D78A3] hover:bg-[#A29CBB] text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailModal;

