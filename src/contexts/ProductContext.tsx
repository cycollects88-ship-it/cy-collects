import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "../utils/supabase-client";
import { Database } from "../database.types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

// Extended type for products with category information
export type ProductWithCategory = Product & {
  category?: Database["public"]["Tables"]["categories"]["Row"] | null;
};

interface ProductContextProps {
  loading: boolean;
  products: Product[];
  productsWithCategory: ProductWithCategory[];
  createProduct: (product: ProductInsert) => Promise<boolean>;
  updateProduct: (productId: string, updates: ProductUpdate) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
  getProductById: (productId: string) => Product | undefined;
  getProductsByCategory: (categoryId: string) => Product[];
  getProductsByCondition: (condition: string) => Product[];
  searchProducts: (query: string) => Product[];
}

const ProductContext = createContext<ProductContextProps | undefined>(undefined);

/**
 * ProductProvider component that manages product state and provides product-related functions
 */
export function ProductProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsWithCategory, setProductsWithCategory] = useState<ProductWithCategory[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            category:categories(*)
          `)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("ProductContext - Error fetching products:", error);
          setProducts([]);
          setProductsWithCategory([]);
        } else {
          setProducts(data || []);
          setProductsWithCategory(data || []);
        }
      } catch (error) {
        console.error("ProductContext - Exception fetching products:", error);
        setProducts([]);
        setProductsWithCategory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Set up real-time subscription for product changes
    const subscription = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "products"
        },
        async (payload) => {
          if (payload.eventType === "INSERT" && payload.new) {
            const newProduct = payload.new as Product;
            setProducts(prev => [newProduct, ...prev]);
            
            // Fetch category for the new product
            let categoryData: Database["public"]["Tables"]["categories"]["Row"] | null = null;
            if (newProduct.category_id) {
              const { data } = await supabase
                .from("categories")
                .select("*")
                .eq("id", newProduct.category_id)
                .single();
              categoryData = data;
            }
            
            setProductsWithCategory(prev => [{
              ...newProduct,
              category: categoryData
            }, ...prev]);
          } else if (payload.eventType === "UPDATE" && payload.new) {
            const updatedProduct = payload.new as Product;
            setProducts(prev => prev.map(product => 
              product.id === updatedProduct.id ? updatedProduct : product
            ));
            
            // Update products with category
            setProductsWithCategory(prev => prev.map(product => 
              product.id === updatedProduct.id ? {
                ...updatedProduct,
                category: product.category
              } : product
            ));
          } else if (payload.eventType === "DELETE" && payload.old) {
            setProducts(prev => prev.filter(product => product.id !== payload.old.id));
            setProductsWithCategory(prev => prev.filter(product => product.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe().catch((error: any) => {
        console.error("ProductContext - Error unsubscribing:", error);
      });
    };
  }, []);

  /**
   * Create a new product
   */
  const createProduct = useCallback(async (product: ProductInsert): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("products")
        .insert([product]);

      if (error) {
        console.error("ProductContext - Error creating product:", error);
        return false;
      }

      console.log("ProductContext - Successfully created product");
      return true;
    } catch (error) {
      console.error("ProductContext - Exception creating product:", error);
      return false;
    }
  }, []);

  /**
   * Update a product
   */
  const updateProduct = useCallback(async (productId: string, updates: ProductUpdate): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", productId);

      if (error) {
        console.error("ProductContext - Error updating product:", error);
        return false;
      }

      console.log("ProductContext - Successfully updated product");
      return true;
    } catch (error) {
      console.error("ProductContext - Exception updating product:", error);
      return false;
    }
  }, []);

  /**
   * Delete a product
   */
  const deleteProduct = useCallback(async (productId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) {
        console.error("ProductContext - Error deleting product:", error);
        return false;
      }

      console.log("ProductContext - Successfully deleted product");
      return true;
    } catch (error) {
      console.error("ProductContext - Exception deleting product:", error);
      return false;
    }
  }, []);

  /**
   * Get product by ID
   */
  const getProductById = useCallback((productId: string): Product | undefined => {
    return products.find(product => product.id === productId);
  }, [products]);

  /**
   * Get products by category
   */
  const getProductsByCategory = useCallback((categoryId: string): Product[] => {
    return products.filter(product => product.category_id === categoryId);
  }, [products]);

  /**
   * Get products by condition
   */
  const getProductsByCondition = useCallback((condition: string): Product[] => {
    return products.filter(product => product.condition === condition);
  }, [products]);

  /**
   * Search products by name
   */
  const searchProducts = useCallback((query: string): Product[] => {
    if (!query.trim()) return products;
    
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product => 
      product.name?.toLowerCase().includes(lowercaseQuery)
    );
  }, [products]);

  const value: ProductContextProps = {
    loading,
    products,
    productsWithCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductsByCategory,
    getProductsByCondition,
    searchProducts,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

/**
 * Hook to use the ProductContext
 */
export function useProductContext(): ProductContextProps {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
}
