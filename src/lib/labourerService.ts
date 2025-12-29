import { supabase } from "./supabase";
import type { Labourer } from "./supabase";

export const labourerService = {
  // Get all labourers
  async getAllLabourers(): Promise<Labourer[]> {
    const { data, error } = await supabase
      .from("labourers")
      .select("*")
      .order("rating", { ascending: false });

    if (error) {
      console.error("Error fetching labourers:", error);
      return [];
    }
    return data || [];
  },

  // Search labourers by location
  async searchByLocation(location: string): Promise<Labourer[]> {
    const { data, error } = await supabase
      .from("labourers")
      .select("*")
      .ilike("location", `%${location}%`)
      .eq("availability", "available")
      .order("rating", { ascending: false });

    if (error) {
      console.error("Error searching labourers:", error);
      return [];
    }
    return data || [];
  },

  // Search labourers by skills
  async searchBySkill(skill: string): Promise<Labourer[]> {
    const { data, error } = await supabase
      .from("labourers")
      .select("*")
      .contains("skills", [skill])
      .eq("availability", "available")
      .order("rating", { ascending: false});

    if (error) {
      console.error("Error searching by skill:", error);
      return [];
    }
    return data || [];
  },

  // Register new labourer
  async registerLabourer(
    labourer: Omit<Labourer, "id" | "rating" | "total_reviews" | "verified" | "created_at" | "updated_at">
  ): Promise<Labourer | null> {
    const { data, error } = await supabase
      .from("labourers")
      .insert([
        {
          ...labourer,
          rating: 0,
          total_reviews: 0,
          verified: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error registering labourer:", error);
      throw error;
    }
    return data;
  },

  // Update labourer profile
  async updateLabourer(id: string, updates: Partial<Labourer>): Promise<Labourer | null> {
    const { data, error } = await supabase
      .from("labourers")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating labourer:", error);
      return null;
    }
    return data;
  },

  // Update availability
  async updateAvailability(id: string, availability: string): Promise<boolean> {
    const { error } = await supabase
      .from("labourers")
      .update({ availability, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error updating availability:", error);
      return false;
    }
    return true;
  },

  // Add review/rating
  async addReview(labourerId: string, rating: number): Promise<boolean> {
    // Get current labourer data
    const { data: labourer, error: fetchError } = await supabase
      .from("labourers")
      .select("rating, total_reviews")
      .eq("id", labourerId)
      .single();

    if (fetchError || !labourer) {
      console.error("Error fetching labourer for review:", fetchError);
      return false;
    }

    // Calculate new rating
    const totalReviews = labourer.total_reviews + 1;
    const newRating =
      (labourer.rating * labourer.total_reviews + rating) / totalReviews;

    // Update labourer
    const { error } = await supabase
      .from("labourers")
      .update({
        rating: newRating,
        total_reviews: totalReviews,
        updated_at: new Date().toISOString(),
      })
      .eq("id", labourerId);

    if (error) {
      console.error("Error adding review:", error);
      return false;
    }
    return true;
  },

  // Get labourer by user ID
  async getLabourerByUserId(userId: string): Promise<Labourer | null> {
    const { data, error } = await supabase
      .from("labourers")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No labourer profile exists
      }
      console.error("Error fetching labourer by user ID:", error);
      return null;
    }
    return data;
  },
};
