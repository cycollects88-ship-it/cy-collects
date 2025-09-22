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
 * WantToBuyProvider component that manages want to buy state and provides want to buy-related functions
 */
export function WantToBuyProvider({ children }: { children: ReactNode }) {
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
    // Temporarily disable Supabase calls for testing
    setWantToBuyItems([]);
    setLoading(false);
    return;
    
    const fetchWantToBuyItems = async () => {
      if (!user) {
        setWantToBuyItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("want_to_buy")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("WantToBuyContext - Error fetching want to buy items:", error);
          setWantToBuyItems([]);
        } else {
          setWantToBuyItems(data || []);
        }
      } catch (error) {
        console.error("WantToBuyContext - Exception fetching want to buy items:", error);
        setWantToBuyItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWantToBuyItems();

    // Set up real-time subscription for want to buy changes
    // Temporarily disabled for testing
    /*
    let subscription: any = null;
    
    if (user) {
      const channelName = `want-to-buy-${user.id}`;
      const handleRealtimeChange = (payload: any) => {
        if (payload.eventType === "INSERT" && payload.new) {
          setWantToBuyItems(prev => [payload.new as WantToBuy, ...prev]);
        } else if (payload.eventType === "UPDATE" && payload.new) {
          setWantToBuyItems(prev => prev.map(item => 
            item.id === payload.new.id ? payload.new as WantToBuy : item
          ));
        } else if (payload.eventType === "DELETE" && payload.old) {
          setWantToBuyItems(prev => prev.filter(item => item.id !== payload.old.id));
        }
      };

      subscription = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          { 
            event: "*", 
            schema: "public", 
            table: "want_to_buy",
            filter: `user_id=eq.${user.id}`
          },
          handleRealtimeChange
        )
        .subscribe();
    }
    */

    return () => {
      // Temporarily disabled for testing
      /*
      if (subscription) {
        subscription.unsubscribe().catch((error: any) => {
          console.error("WantToBuyContext - Error unsubscribing:", error);
        });
      }
      */
    };
  }, [user]);

  /**
   * Add item to want to buy list
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
        console.error("WantToBuyContext - Error adding want to buy item:", error);
        return false;
      }

      console.log("WantToBuyContext - Successfully added want to buy item");
      return true;
    } catch (error) {
      console.error("WantToBuyContext - Exception adding want to buy item:", error);
      return false;
    }
  }, [user]);

  /**
   * Update want to buy item
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
        console.error("WantToBuyContext - Error updating want to buy item:", error);
        return false;
      }

      console.log("WantToBuyContext - Successfully updated want to buy item");
      return true;
    } catch (error) {
      console.error("WantToBuyContext - Exception updating want to buy item:", error);
      return false;
    }
  }, [user]);

  /**
   * Delete want to buy item
   */
  const deleteWantToBuy = useCallback(async (itemId: string): Promise<boolean> => {
    if (!user) {
      console.error("WantToBuyContext - User not authenticated");
      return false;
    }

    try {
      const { error } = await supabase
        .from("want_to_buy")
        .delete()
        .eq("id", itemId)
        .eq("user_id", user.id);

      if (error) {
        console.error("WantToBuyContext - Error deleting want to buy item:", error);
        return false;
      }

      console.log("WantToBuyContext - Successfully deleted want to buy item");
      return true;
    } catch (error) {
      console.error("WantToBuyContext - Exception deleting want to buy item:", error);
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
   * Get want to buy items by user
   */
  const getWantToBuyByUser = useCallback((userId: string): WantToBuy[] => {
    return wantToBuyItems.filter(item => item.user_id === userId);
  }, [wantToBuyItems]);

  /**
   * Get want to buy item by ID
   */
  const getWantToBuyById = useCallback((itemId: string): WantToBuy | undefined => {
    return wantToBuyItems.find(item => item.id === itemId);
  }, [wantToBuyItems]);

  /**
   * Search want to buy items by card name
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

  const value: WantToBuyContextProps = {
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
  };

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
