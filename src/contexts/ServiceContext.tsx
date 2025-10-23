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

export type Service = Database["public"]["Tables"]["services"]["Row"];
export type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];
export type ServiceUpdate = Database["public"]["Tables"]["services"]["Update"];

interface ServiceContextProps {
  loading: boolean;
  services: Service[];
  createService: (service: ServiceInsert) => Promise<boolean>;
  updateService: (serviceId: string, updates: ServiceUpdate) => Promise<boolean>;
  deleteService: (serviceId: string) => Promise<boolean>;
  getServiceById: (serviceId: string) => Service | undefined;
  searchServices: (query: string) => Service[];
  getServicesByPriceRange: (minPrice: number, maxPrice: number) => Service[];
}

const ServiceContext = createContext<ServiceContextProps | undefined>(undefined);

/**
 * ServiceProvider component that manages service state and provides service-related functions
 */
export function ServiceProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("ServiceContext - Error fetching services:", error);
          setServices([]);
        } else {
          setServices(data || []);
        }
      } catch (error) {
        console.error("ServiceContext - Exception fetching services:", error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();

    // Set up real-time subscription for service changes
    const subscription = supabase
      .channel("services-changes")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "services"
        },
        (payload) => {
          if (payload.eventType === "INSERT" && payload.new) {
            setServices(prev => [payload.new as Service, ...prev]);
          } else if (payload.eventType === "UPDATE" && payload.new) {
            setServices(prev => prev.map(service => 
              service.id === payload.new.id ? payload.new as Service : service
            ));
          } else if (payload.eventType === "DELETE" && payload.old) {
            setServices(prev => prev.filter(service => service.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe().catch((error: any) => {
        console.error("ServiceContext - Error unsubscribing:", error);
      });
    };
  }, []);

  /**
   * Create a new service
   */
  const createService = useCallback(async (service: ServiceInsert): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("services")
        .insert([service]);

      if (error) {
        console.error("ServiceContext - Error creating service:", error);
        return false;
      }

      console.log("ServiceContext - Successfully created service");
      return true;
    } catch (error) {
      console.error("ServiceContext - Exception creating service:", error);
      return false;
    }
  }, []);

  /**
   * Update a service
   */
  const updateService = useCallback(async (serviceId: string, updates: ServiceUpdate): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("services")
        .update(updates)
        .eq("id", serviceId);

      if (error) {
        console.error("ServiceContext - Error updating service:", error);
        return false;
      }

      console.log("ServiceContext - Successfully updated service");
      return true;
    } catch (error) {
      console.error("ServiceContext - Exception updating service:", error);
      return false;
    }
  }, []);

  /**
   * Delete a service
   */
  const deleteService = useCallback(async (serviceId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);

      if (error) {
        console.error("ServiceContext - Error deleting service:", error);
        return false;
      }

      console.log("ServiceContext - Successfully deleted service");
      return true;
    } catch (error) {
      console.error("ServiceContext - Exception deleting service:", error);
      return false;
    }
  }, []);

  /**
   * Get service by ID
   */
  const getServiceById = useCallback((serviceId: string): Service | undefined => {
    return services.find(service => service.id === serviceId);
  }, [services]);

  /**
   * Search services by name
   */
  const searchServices = useCallback((query: string): Service[] => {
    if (!query.trim()) return services;
    
    const lowercaseQuery = query.toLowerCase();
    return services.filter(service => 
      service.name?.toLowerCase().includes(lowercaseQuery)
    );
  }, [services]);

  /**
   * Get services by price range
   */
  const getServicesByPriceRange = useCallback((minPrice: number, maxPrice: number): Service[] => {
    return services.filter(service => {
      const price = service.price || 0;
      return price >= minPrice && price <= maxPrice;
    });
  }, [services]);

  const value: ServiceContextProps = {
    loading,
    services,
    createService,
    updateService,
    deleteService,
    getServiceById,
    searchServices,
    getServicesByPriceRange,
  };

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
}

/**
 * Hook to use the ServiceContext
 */
export function useServiceContext(): ServiceContextProps {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error("useServiceContext must be used within a ServiceProvider");
  }
  return context;
}
