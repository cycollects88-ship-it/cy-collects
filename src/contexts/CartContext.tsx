import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { supabase } from "../utils/supabase-client";
import { Database } from "../database.types";
import { useAuthContext } from "./AuthContext";

export type Cart = Database["public"]["Tables"]["carts"]["Row"];
export type CartInsert = Database["public"]["Tables"]["carts"]["Insert"];
export type CartUpdate = Database["public"]["Tables"]["carts"]["Update"];

interface CartContextProps {
  cart: Cart[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<{ error: any }>;
  addServiceToCart: (serviceId: string, quantity?: number) => Promise<{ error: any }>;
  removeFromCart: (productId: string) => Promise<{ error: any }>;
  removeServiceFromCart: (serviceId: string) => Promise<{ error: any }>;
  updateCartItem: (productId: string, quantity: number) => Promise<{ error: any }>;
  clearCart: () => Promise<{ error: any }>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  const mountedRef = useRef(true);

  // Fetch cart when user changes
  useEffect(() => {
    let mounted = true;

    const fetchCart = async () => {
      if (!user) {
        if (mounted) {
          setCart([]);
          setLoading(false);
        }
        return;
      }

      try {
        if (mounted) {
          setLoading(true);
        }
        
        const { data, error } = await supabase
          .from("carts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching cart:", error);
          if (mounted) {
            setCart([]);
            setLoading(false);
          }
        } else if (mounted) {
          setCart(data || []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in fetchCart:", error);
        if (mounted) {
          setCart([]);
          setLoading(false);
        }
      }
    };

    fetchCart();

    return () => {
      mounted = false;
    };
  }, [user]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      return { error: "No user logged in" };
    }

    try {
      // Check if item already exists in cart
      const existingItem = cart.find(item => item.product_id === productId);
      
      if (existingItem) {
        // Update existing item
        return await updateCartItem(productId, (existingItem.amount || 0) + quantity);
      }

      // Add new item
      const { data, error } = await supabase
        .from("carts")
        .insert([{
          user_id: user.id,
          product_id: productId,
          amount: quantity
        }])
        .select("*")
        .single();

      if (error) {
        console.error("Error adding to cart:", error);
        return { error };
      }

      if (mountedRef.current) {
        setCart(prev => [data, ...prev]);
      }

      return { error: null };
    } catch (error) {
      console.error("Error in addToCart:", error);
      return { error };
    }
  };

  /**
   * Add a service to cart
   */
  const addServiceToCart = async (serviceId: string, quantity: number = 1) => {
    if (!user) {
      return { error: "No user logged in" };
    }

    try {
      // Check if service already exists in cart
      const existingItem = cart.find(item => item.service_id === serviceId);
      
      if (existingItem) {
        // Update existing item quantity
        const { data, error } = await supabase
          .from("carts")
          .update({ amount: (existingItem.amount || 0) + quantity })
          .eq("user_id", user.id)
          .eq("service_id", serviceId)
          .select("*")
          .single();

        if (error) {
          console.error("Error updating service in cart:", error);
          return { error };
        }

        if (mountedRef.current) {
          setCart(prev => 
            prev.map(item => 
              item.service_id === serviceId ? data : item
            )
          );
        }

        return { error: null };
      }

      // Add new service to cart
      const { data, error } = await supabase
        .from("carts")
        .insert([{
          user_id: user.id,
          service_id: serviceId,
          amount: quantity
        }])
        .select("*")
        .single();

      if (error) {
        console.error("Error adding service to cart:", error);
        return { error };
      }

      if (mountedRef.current) {
        setCart(prev => [data, ...prev]);
      }

      return { error: null };
    } catch (error) {
      console.error("Error in addServiceToCart:", error);
      return { error };
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) {
      return { error: "No user logged in" };
    }

    try {
      const { error } = await supabase
        .from("carts")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) {
        console.error("Error removing from cart:", error);
        return { error };
      }

      if (mountedRef.current) {
        setCart(prev => prev.filter(item => item.product_id !== productId));
      }

      return { error: null };
    } catch (error) {
      console.error("Error in removeFromCart:", error);
      return { error };
    }
  };

  /**
   * Remove a service from cart
   */
  const removeServiceFromCart = async (serviceId: string) => {
    if (!user) {
      return { error: "No user logged in" };
    }

    try {
      const { error } = await supabase
        .from("carts")
        .delete()
        .eq("user_id", user.id)
        .eq("service_id", serviceId);

      if (error) {
        console.error("Error removing service from cart:", error);
        return { error };
      }

      if (mountedRef.current) {
        setCart(prev => prev.filter(item => item.service_id !== serviceId));
      }

      return { error: null };
    } catch (error) {
      console.error("Error in removeServiceFromCart:", error);
      return { error };
    }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    if (!user) {
      return { error: "No user logged in" };
    }

    if (quantity <= 0) {
      return await removeFromCart(productId);
    }

    try {
      const { data, error } = await supabase
        .from("carts")
        .update({ amount: quantity })
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .select("*")
        .single();

      if (error) {
        console.error("Error updating cart item:", error);
        return { error };
      }

      if (mountedRef.current) {
        setCart(prev => 
          prev.map(item => 
            item.product_id === productId ? data : item
          )
        );
      }

      return { error: null };
    } catch (error) {
      console.error("Error in updateCartItem:", error);
      return { error };
    }
  };

  const clearCart = async () => {
    if (!user) {
      return { error: "No user logged in" };
    }

    try {
      const { error } = await supabase
        .from("carts")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error("Error clearing cart:", error);
        return { error };
      }

      if (mountedRef.current) {
        setCart([]);
      }

      return { error: null };
    } catch (error) {
      console.error("Error in clearCart:", error);
      return { error };
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      // For now, return 0 since we don't have product price in cart
      // This would need to be calculated by fetching product prices
      return total + (item.amount || 0);
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + (item.amount || 0), 0);
  };

  const value: CartContextProps = {
    cart,
    loading,
    addToCart,
    addServiceToCart,
    removeFromCart,
    removeServiceFromCart,
    updateCartItem,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
