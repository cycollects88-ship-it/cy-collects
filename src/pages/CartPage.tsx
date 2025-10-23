import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCartContext } from "../contexts/CartContext";
import { useProductContext } from "../contexts/ProductContext";
import { useServiceContext } from "../contexts/ServiceContext";

/**
 * Cart Page Component
 * Displays cart items (both products and services) with WhatsApp ordering functionality
 */
const CartPage: React.FC = () => {
  const { cart, loading: cartLoading, removeFromCart, removeServiceFromCart, updateCartItem } = useCartContext();
  const { products, loading: productsLoading } = useProductContext();
  const { services, loading: servicesLoading } = useServiceContext();

  // WhatsApp business number
  const WHATSAPP_NUMBER = "6738997282"; // +673 8997282 formatted for WhatsApp

  /**
   * Get product details from cart item - memoized to prevent infinite loops
   */
  const cartItems = useMemo(() => {
    return cart.map(item => {
      if (item.product_id) {
        const product = products.find(p => p.id === item.product_id);
        return {
          ...item,
          type: "product" as const,
          details: product,
          name: product?.name || "Unknown Product",
          price: product?.price || 0,
          image: product?.media_url_front || undefined,
        };
      } else if (item.service_id) {
        const service = services.find(s => s.id === item.service_id);
        return {
          ...item,
          type: "service" as const,
          details: service,
          name: service?.name || "Unknown Service",
          price: service?.price || 0,
          image: service?.media_url || undefined,
        };
      }
      return null;
    }).filter(Boolean);
  }, [cart, products, services]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      if (!item) return total;
      return total + (item.price * (item.amount || 1));
    }, 0);
  }, [cartItems]);

  const tax = subtotal * 0; // No tax for now
  const total = subtotal + tax;

  // Show combined loading state
  const isLoading = cartLoading || productsLoading || servicesLoading;

  /**
   * Handle quantity update
   */
  const handleQuantityChange = async (item: NonNullable<typeof cartItems[0]>, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    if (item.product_id) {
      await updateCartItem(item.product_id, newQuantity);
    }
  };

  /**
   * Handle item removal
   */
  const handleRemoveItem = async (item: NonNullable<typeof cartItems[0]>) => {
    if (item.product_id) {
      await removeFromCart(item.product_id);
    } else if (item.service_id) {
      await removeServiceFromCart(item.service_id);
    }
  };

  /**
   * Generate WhatsApp message with all cart items
   */
  const generateWhatsAppMessage = (): string => {
    let message = "Hello! I would like to order the following items:\n\n";

    // Add products
    const productItems = cartItems.filter(item => item && item.type === "product");
    if (productItems.length > 0) {
      message += "*Products:*\n";
      let productIndex = 0;
      for (const item of productItems) {
        if (!item) continue;
        productIndex++;
        message += `${productIndex}. ${item.name}\n`;
        message += `   Quantity: ${item.amount || 1}\n`;
        message += `   Price: BND $${item.price.toLocaleString()} each\n`;
        message += `   Subtotal: BND $${(item.price * (item.amount || 1)).toLocaleString()}\n\n`;
      }
    }

    // Add services
    const serviceItems = cartItems.filter(item => item && item.type === "service");
    if (serviceItems.length > 0) {
      message += "*Services:*\n";
      let serviceIndex = 0;
      for (const item of serviceItems) {
        if (!item) continue;
        serviceIndex++;
        message += `${serviceIndex}. ${item.name}\n`;
        message += `   Price: BND $${item.price.toLocaleString()}\n\n`;
      }
    }

    // Add total
    message += `*Total Amount: BND $${total.toLocaleString()}*\n\n`;
    message += "Please let me know the next steps. Thank you!";

    return encodeURIComponent(message);
  };

  /**
   * Handle WhatsApp order button click
   */
  const handleWhatsAppOrder = () => {
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D78A3]"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Start shopping to add items to your cart!</p>
            <Link
              to="/"
              className="inline-block bg-[#7D78A3] hover:bg-[#A29CBB] text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">{cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {cartItems.map((item) => {
                if (!item) return null;
                
                return (
                  <div key={item.id} className="p-6 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      {/* Image */}
                      <div className="flex-shrink-0 w-24 h-24">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              {item.type === "product" ? "Product" : "Service"}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-600">Qty:</span>
                            {item.type === "product" ? (
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                  onClick={() => handleQuantityChange(item, (item.amount || 1) - 1)}
                                  className="px-3 py-1 hover:bg-gray-100 transition-colors duration-200"
                                  disabled={item.amount === 1}
                                >
                                  -
                                </button>
                                <span className="px-4 py-1 border-x border-gray-300">{item.amount || 1}</span>
                                <button
                                  onClick={() => handleQuantityChange(item, (item.amount || 1) + 1)}
                                  className="px-3 py-1 hover:bg-gray-100 transition-colors duration-200"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <span className="px-4 py-1">{item.amount || 1}</span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-[#7D78A3]">
                              BND ${(item.price * (item.amount || 1)).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">BND ${item.price.toLocaleString()} each</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">BND ${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">BND ${tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-[#7D78A3]">BND ${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleWhatsAppOrder}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mb-3 flex items-center justify-center space-x-2"
              >
                <svg 
                  className="w-6 h-6" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>Order via WhatsApp</span>
              </button>

              <Link
                to="/"
                className="block w-full text-center text-[#7D78A3] hover:text-[#A29CBB] font-medium py-2 transition-colors duration-200"
              >
                Continue Shopping
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Complete your order through WhatsApp for personalized service
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

