import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import { supabase } from "../utils/supabase-client";
import { Database } from "../database.types";
import { useAuthContext } from "./AuthContext";

export type WantToBuy = Database["public"]["Tables"]["want_to_buy"]["Row"];
export type WantToBuyInsert = Database["public"]["Tables"]["want_to_buy"]["Insert"];
export type WantToBuyUpdate = Database["public"]["Tables"]["want_to_buy"]["Update"];

interface WantToBuyContextProps {
  loading: boolean;
  wantToBuyItems: WantToBuy[];
  completedItems: WantToBuy[];
  pendingItems: WantToBuy[];
  addWantToBuy: (item: WantToBuyInsert) => Promise<boolean>;
  updateWantToBuy: (itemId: string, updates: WantToBuyUpdate) => Promise<boolean>;
  deleteWantToBuy: (itemId: string) => Promise<boolean>;
  markAsDone: (itemId: string) => Promise<boolean>;
  markAsPending: (itemId: string) => Promise<boolean>;
  getWantToBuyByUser: (userId: string) => WantToBuy[];
  getWantToBuyById: (itemId: string) => WantToBuy | undefined;
  searchWantToBuy: (query: string) => WantToBuy[];
}

const WantToBuyContext = createContext<WantToBuyContextProps | undefined>(undefined);

/**
 * WantToBuyProvider component that manages card request state and provides card request-related functions
 */
export function WantToBuyProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [loading, setLoading] = useState<boolean>(true);
  const [wantToBuyItems, setWantToBuyItems] = useState<WantToBuy[]>([]);
  const { user } = useAuthContext();
  
  // Use ref to avoid closure issues in real-time handlers
  const userRef = useRef(user);
  
  // Update ref when user changes
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const fetchWantToBuyItems = async () => {
      try {
        setLoading(true);
        
        // Fetch all card request items (admin needs to see all, not just user's)
        const { data, error } = await supabase
          .from("want_to_buy")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("WantToBuyContext - Error fetching card request items:", error);
          setWantToBuyItems([]);
        } else {
          setWantToBuyItems(data || []);
        }
      } catch (error) {
        console.error("WantToBuyContext - Exception fetching card request items:", error);
        setWantToBuyItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWantToBuyItems();

    // Set up real-time subscription for card request changes
    const channelName = "want-to-buy-all";
    const subscription = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "want_to_buy"
        },
        async (payload) => {
          if (payload.eventType === "INSERT" && payload.new) {
            setWantToBuyItems(prev => [payload.new as WantToBuy, ...prev]);
          } else if (payload.eventType === "UPDATE" && payload.new) {
            setWantToBuyItems(prev => prev.map(item => 
              item.id === (payload.new as WantToBuy).id ? payload.new as WantToBuy : item
            ));
          } else if (payload.eventType === "DELETE" && payload.old) {
            setWantToBuyItems(prev => prev.filter(item => item.id !== (payload.old as WantToBuy).id));
          }
        }
      )
      .subscribe();

    return () => {
      if (subscription) {
        subscription.unsubscribe().catch((error: unknown) => {
          console.error("WantToBuyContext - Error unsubscribing:", error);
        });
      }
    };
  }, []);

  /**
   * Add item to card request list
   */
  const addWantToBuy = useCallback(async (item: WantToBuyInsert): Promise<boolean> => {
    if (!user) {
      console.error("WantToBuyContext - User not authenticated");
      return false;
    }

    try {
      const { error } = await supabase
        .from("want_to_buy")
        .insert([{ ...item, user_id: user.id }]);

      if (error) {
        console.error("WantToBuyContext - Error adding card request item:", error);
        return false;
      }

      console.log("WantToBuyContext - Successfully added card request item");
      return true;
    } catch (error) {
      console.error("WantToBuyContext - Exception adding card request item:", error);
      return false;
    }
  }, [user]);

  /**
   * Update card request item
   */
  const updateWantToBuy = useCallback(async (itemId: string, updates: WantToBuyUpdate): Promise<boolean> => {
    if (!user) {
      console.error("WantToBuyContext - User not authenticated");
      return false;
    }

    try {
      const { error } = await supabase
        .from("want_to_buy")
        .update(updates)
        .eq("id", itemId)
        .eq("user_id", user.id);

      if (error) {
        console.error("WantToBuyContext - Error updating card request item:", error);
        return false;
      }

      console.log("WantToBuyContext - Successfully updated card request item");
      return true;
    } catch (error) {
      console.error("WantToBuyContext - Exception updating card request item:", error);
      return false;
    }
  }, [user]);

  /**
   * Delete card request item
   * Note: Admins can delete any request (no user_id check), regular users would be restricted by RLS policies
   */
  const deleteWantToBuy = useCallback(async (itemId: string): Promise<boolean> => {
    if (!user) {
      console.error("WantToBuyContext - User not authenticated");
      return false;
    }

    try {
      // Remove user_id check to allow admins to delete any request
      const { error } = await supabase
        .from("want_to_buy")
        .delete()
        .eq("id", itemId);

      if (error) {
        console.error("WantToBuyContext - Error deleting card request item:", error);
        return false;
      }

      console.log("WantToBuyContext - Successfully deleted card request item");
      return true;
    } catch (error) {
      console.error("WantToBuyContext - Exception deleting card request item:", error);
      return false;
    }
  }, [user]);

  /**
   * Mark item as done
   */
  const markAsDone = useCallback(async (itemId: string): Promise<boolean> => {
    return updateWantToBuy(itemId, { done: true });
  }, [updateWantToBuy]);

  /**
   * Mark item as pending
   */
  const markAsPending = useCallback(async (itemId: string): Promise<boolean> => {
    return updateWantToBuy(itemId, { done: false });
  }, [updateWantToBuy]);

  /**
   * Get card request items by user
   */
  const getWantToBuyByUser = useCallback((userId: string): WantToBuy[] => {
    return wantToBuyItems.filter(item => item.user_id === userId);
  }, [wantToBuyItems]);

  /**
   * Get card request item by ID
   */
  const getWantToBuyById = useCallback((itemId: string): WantToBuy | undefined => {
    return wantToBuyItems.find(item => item.id === itemId);
  }, [wantToBuyItems]);

  /**
   * Search card request items by card name
   */
  const searchWantToBuy = useCallback((query: string): WantToBuy[] => {
    if (!query.trim()) return wantToBuyItems;
    
    const lowercaseQuery = query.toLowerCase();
    return wantToBuyItems.filter(item => 
      item.card_name?.toLowerCase().includes(lowercaseQuery)
    );
  }, [wantToBuyItems]);

  // Computed values
  const completedItems = wantToBuyItems.filter(item => item.done === true);
  const pendingItems = wantToBuyItems.filter(item => item.done !== true);

  const value: WantToBuyContextProps = React.useMemo(() => ({
    loading,
    wantToBuyItems,
    completedItems,
    pendingItems,
    addWantToBuy,
    updateWantToBuy,
    deleteWantToBuy,
    markAsDone,
    markAsPending,
    getWantToBuyByUser,
    getWantToBuyById,
    searchWantToBuy,
  }), [
    loading,
    wantToBuyItems,
    completedItems,
    pendingItems,
    addWantToBuy,
    updateWantToBuy,
    deleteWantToBuy,
    markAsDone,
    markAsPending,
    getWantToBuyByUser,
    getWantToBuyById,
    searchWantToBuy,
  ]);

  return (
    <WantToBuyContext.Provider value={value}>
      {children}
    </WantToBuyContext.Provider>
  );
}

/**
 * Hook to use the WantToBuyContext
 */
export function useWantToBuyContext(): WantToBuyContextProps {
  const context = useContext(WantToBuyContext);
  if (context === undefined) {
    throw new Error("useWantToBuyContext must be used within a WantToBuyProvider");
  }
  return context;
}
