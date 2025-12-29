import { supabase } from "./supabase";
import type { GovernmentScheme } from "./supabase";

export const schemeService = {
  // Get all cached schemes
  async getCachedSchemes(): Promise<GovernmentScheme[]> {
    const { data, error } = await supabase
      .from("government_schemes")
      .select("*")
      .order("created_at", { ascending: false});

    if (error) {
      console.error("Error fetching cached schemes:", error);
      return [];
    }
    return data || [];
  },

  // Get schemes by category
  async getSchemesByCategory(category: string): Promise<GovernmentScheme[]> {
    const { data, error } = await supabase
      .from("government_schemes")
      .select("*")
      .eq("category", category)
      .order("last_updated", { ascending: false });

    if (error) {
      console.error("Error fetching schemes by category:", error);
      return [];
    }
    return data || [];
  },

  // Get schemes by state
  async getSchemesByState(state: string): Promise<GovernmentScheme[]> {
    const { data, error } = await supabase
      .from("government_schemes")
      .select("*")
      .or(`state.eq.${state},state.eq.All India`)
      .order("last_updated", { ascending: false });

    if (error) {
      console.error("Error fetching schemes by state:", error);
      return [];
    }
    return data || [];
  },

  // Cache new scheme
  async cacheScheme(
    scheme: Omit<GovernmentScheme, "id" | "created_at">
  ): Promise<GovernmentScheme | null> {
    // Check if scheme already exists
    const { data: existing } = await supabase
      .from("government_schemes")
      .select("*")
      .eq("scheme_name", scheme.scheme_name)
      .single();

    if (existing) {
      // Update existing scheme
      return await this.updateScheme(existing.id, scheme);
    }

    // Insert new scheme
    const { data, error } = await supabase
      .from("government_schemes")
      .insert([scheme])
      .select()
      .single();

    if (error) {
      console.error("Error caching scheme:", error);
      return null;
    }
    return data;
  },

  // Update scheme
  async updateScheme(
    id: string,
    updates: Partial<GovernmentScheme>
  ): Promise<GovernmentScheme | null> {
    const { data, error } = await supabase
      .from("government_schemes")
      .update({ ...updates, last_updated: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating scheme:", error);
      return null;
    }
    return data;
  },

  // Search schemes
  async searchSchemes(searchTerm: string): Promise<GovernmentScheme[]> {
    const { data, error } = await supabase
      .from("government_schemes")
      .select("*")
      .or(
        `scheme_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,benefits.ilike.%${searchTerm}%`
      )
      .order("last_updated", { ascending: false });

    if (error) {
      console.error("Error searching schemes:", error);
      return [];
    }
    return data || [];
  },

  // Check if cache needs refresh (older than 7 days)
  async needsRefresh(): Promise<boolean> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from("government_schemes")
      .select("last_updated")
      .order("last_updated", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return true; // No data or error, needs refresh
    }

    return new Date(data.last_updated) < sevenDaysAgo;
  },
};
