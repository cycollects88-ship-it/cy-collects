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

  // Fetch user details when user changes
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) {
        setUserDetails(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("user_details")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user details:", error);
          setUserDetails(null);
        } else if (mountedRef.current) {
          setUserDetails(data);
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

    return () => {
      mountedRef.current = false;
    };
  }, [user]);

  const updateUserDetails = async (updates: UserDetailsUpdate) => {
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
  };

  const createUserDetails = async (userDetails: UserDetailsInsert) => {
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
  };

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
