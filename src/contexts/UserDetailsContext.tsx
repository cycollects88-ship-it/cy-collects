import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { supabase } from "../utils/supabase-client";
import { Database } from "../database.types";
import { useAuthContext } from "./AuthContext";

export type UserDetails = Database["public"]["Tables"]["user_details"]["Row"];
export type UserDetailsInsert = Database["public"]["Tables"]["user_details"]["Insert"];
export type UserDetailsUpdate = Database["public"]["Tables"]["user_details"]["Update"];

interface UserDetailsContextProps {
  userDetails: UserDetails | null;
  loading: boolean;
  updateUserDetails: (updates: UserDetailsUpdate) => Promise<{ error: any }>;
  createUserDetails: (userDetails: UserDetailsInsert) => Promise<{ error: any }>;
}

const UserDetailsContext = createContext<UserDetailsContextProps | undefined>(undefined);

export const useUserDetailsContext = () => {
  const context = useContext(UserDetailsContext);
  if (!context) {
    throw new Error("useUserDetailsContext must be used within a UserDetailsProvider");
  }
  return context;
};

interface UserDetailsProviderProps {
  children: React.ReactNode;
}

export const UserDetailsProvider: React.FC<UserDetailsProviderProps> = ({ children }) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  const mountedRef = useRef(true);
  const creatingRef = useRef(false); // Prevent duplicate creation

  // Fetch user details when user changes
  useEffect(() => {
    // Reset refs when effect runs (important for account switching)
    mountedRef.current = true;
    creatingRef.current = false;
    
    const fetchUserDetails = async () => {
      if (!user) {
        setUserDetails(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // First, try to get existing user_details (may return multiple rows if duplicates exist)
        const { data: allData, error: selectError } = await supabase
          .from("user_details")
          .select("*")
          .eq("user_id", user.id);

        // If we found data, use the first (most recent) one
        if (allData && allData.length > 0) {
          if (mountedRef.current) {
            setUserDetails(allData[0]);
          }
          if (allData.length > 1) {
            console.warn(`Found ${allData.length} user_details rows for user ${user.id}. Using the first one.`);
          }
        } else if (selectError || !allData || allData.length === 0) {
          // No row exists, create one (but only if not already creating)
          if (creatingRef.current) {
            // Already creating, skip
            console.log("Already creating user_details, skipping");
          } else {
            creatingRef.current = true;
            console.log("No user_details found, creating new row for user:", user.id);
            
            const { data: newData, error: insertError } = await supabase
              .from("user_details")
              .insert([
                {
                  user_id: user.id,
                  role: "customer", // Default role for new users
                }
              ])
              .select()
              .single();

            creatingRef.current = false;

            if (insertError) {
              console.error("Error creating user details:", insertError);
              setUserDetails(null);
            } else if (mountedRef.current) {
              setUserDetails(newData);
            }
          }
        }
      } catch (error) {
        console.error("Error in fetchUserDetails:", error);
        if (mountedRef.current) {
          setUserDetails(null);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchUserDetails();

    // Set up real-time subscription for user_details changes
    const subscription = supabase
      .channel(`user_details_${user?.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_details",
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          if (mountedRef.current && payload.new) {
            setUserDetails(payload.new as UserDetails);
          }
        }
      )
      .subscribe();

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe().catch(console.error);
    };
  }, [user]);

  const updateUserDetails = useCallback(async (updates: UserDetailsUpdate) => {
    if (!user) {
      return { error: "No user logged in" };
    }

    try {
      const { data, error } = await supabase
        .from("user_details")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating user details:", error);
        return { error };
      }

      if (mountedRef.current) {
        setUserDetails(data);
      }

      return { error: null };
    } catch (error) {
      console.error("Error in updateUserDetails:", error);
      return { error };
    }
  }, [user]);

  const createUserDetails = useCallback(async (userDetails: UserDetailsInsert) => {
    if (!user) {
      return { error: "No user logged in" };
    }

    try {
      const { data, error } = await supabase
        .from("user_details")
        .insert([{ ...userDetails, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error("Error creating user details:", error);
        return { error };
      }

      if (mountedRef.current) {
        setUserDetails(data);
      }

      return { error: null };
    } catch (error) {
      console.error("Error in createUserDetails:", error);
      return { error };
    }
  }, [user]);

  // Note: Not using useMemo here intentionally to ensure context updates propagate immediately
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const value: UserDetailsContextProps = {
    userDetails,
    loading,
    updateUserDetails,
    createUserDetails,
  };

  return (
    <UserDetailsContext.Provider value={value}>
      {children}
    </UserDetailsContext.Provider>
  );
};
