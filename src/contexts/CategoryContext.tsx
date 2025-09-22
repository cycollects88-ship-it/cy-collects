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

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
export type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

interface CategoryContextProps {
  loading: boolean;
  categories: Category[];
  activeCategories: Category[];
  createCategory: (category: CategoryInsert) => Promise<boolean>;
  updateCategory: (categoryId: string, updates: CategoryUpdate) => Promise<boolean>;
  deleteCategory: (categoryId: string) => Promise<boolean>;
  toggleCategoryActive: (categoryId: string) => Promise<boolean>;
  getCategoryById: (categoryId: string) => Category | undefined;
}

const CategoryContext = createContext<CategoryContextProps | undefined>(undefined);

/**
 * CategoryProvider component that manages category state and provides category-related functions
 */
export function CategoryProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          console.error("CategoryContext - Error fetching categories:", error);
          setCategories([]);
        } else {
          setCategories(data || []);
        }
      } catch (error) {
        console.error("CategoryContext - Exception fetching categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();

    // Set up real-time subscription for category changes
    const subscription = supabase
      .channel("categories-changes")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "categories"
        },
        (payload) => {
          if (payload.eventType === "INSERT" && payload.new) {
            setCategories(prev => [...prev, payload.new as Category].sort((a, b) => 
              (a.name || "").localeCompare(b.name || "")
            ));
          } else if (payload.eventType === "UPDATE" && payload.new) {
            setCategories(prev => prev.map(category => 
              category.id === payload.new.id ? payload.new as Category : category
            ).sort((a, b) => (a.name || "").localeCompare(b.name || "")));
          } else if (payload.eventType === "DELETE" && payload.old) {
            setCategories(prev => prev.filter(category => category.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe().catch((error: any) => {
        console.error("CategoryContext - Error unsubscribing:", error);
      });
    };
  }, []);

  /**
   * Create a new category
   */
  const createCategory = useCallback(async (category: CategoryInsert): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("categories")
        .insert([category]);

      if (error) {
        console.error("CategoryContext - Error creating category:", error);
        return false;
      }

      console.log("CategoryContext - Successfully created category");
      return true;
    } catch (error) {
      console.error("CategoryContext - Exception creating category:", error);
      return false;
    }
  }, []);

  /**
   * Update a category
   */
  const updateCategory = useCallback(async (categoryId: string, updates: CategoryUpdate): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", categoryId);

      if (error) {
        console.error("CategoryContext - Error updating category:", error);
        return false;
      }

      console.log("CategoryContext - Successfully updated category");
      return true;
    } catch (error) {
      console.error("CategoryContext - Exception updating category:", error);
      return false;
    }
  }, []);

  /**
   * Delete a category
   */
  const deleteCategory = useCallback(async (categoryId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) {
        console.error("CategoryContext - Error deleting category:", error);
        return false;
      }

      console.log("CategoryContext - Successfully deleted category");
      return true;
    } catch (error) {
      console.error("CategoryContext - Exception deleting category:", error);
      return false;
    }
  }, []);

  /**
   * Toggle category active status
   */
  const toggleCategoryActive = useCallback(async (categoryId: string): Promise<boolean> => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) {
      console.error("CategoryContext - Category not found");
      return false;
    }

    return updateCategory(categoryId, { active: !category.active });
  }, [categories, updateCategory]);

  /**
   * Get category by ID
   */
  const getCategoryById = useCallback((categoryId: string): Category | undefined => {
    return categories.find(category => category.id === categoryId);
  }, [categories]);

  // Computed values
  const activeCategories = categories.filter(category => category.active !== false);

  const value: CategoryContextProps = {
    loading,
    categories,
    activeCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryActive,
    getCategoryById,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

/**
 * Hook to use the CategoryContext
 */
export function useCategoryContext(): CategoryContextProps {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategoryContext must be used within a CategoryProvider");
  }
  return context;
}
