// Export all contexts and hooks
export { AuthProvider, useAuthContext } from './AuthContext';
export { CartProvider, useCartContext } from './CartContext';
export { CategoryProvider, useCategoryContext } from './CategoryContext';
export { ProductProvider, useProductContext } from './ProductContext';
export { ServiceProvider, useServiceContext } from './ServiceContext';
export { UserDetailsProvider, useUserDetailsContext } from './UserDetailsContext';
export { WantToBuyProvider, useWantToBuyContext } from './WantToBuyContext';

// Export types
export type { UserDetails, UserDetailsInsert, UserDetailsUpdate } from './UserDetailsContext';
export type { Cart, CartInsert, CartUpdate } from './CartContext';
export type { Category, CategoryInsert, CategoryUpdate } from './CategoryContext';
export type { Product, ProductInsert, ProductUpdate, ProductWithCategory } from './ProductContext';
export type { Service, ServiceInsert, ServiceUpdate } from './ServiceContext';
export type { WantToBuy, WantToBuyInsert, WantToBuyUpdate } from './WantToBuyContext';
