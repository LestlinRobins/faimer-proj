import { supabase } from "./supabase";
import type { UserProfile } from "./supabase";

export const profileService = {
  // Get or create user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Profile doesn't exist, create one
        return await this.createProfile(userId);
      }
      console.error("Error fetching profile:", error);
      return null;
    }
    return data;
  },

  // Create new profile
  async createProfile(userId: string, data: Partial<UserProfile> = {}): Promise<UserProfile | null> {
    const profile = {
      user_id: userId,
      language: data.language || "en",
      ...data,
    };

    const { data: newProfile, error } = await supabase
      .from("user_profiles")
      .insert([profile])
      .select()
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      return null;
    }
    return newProfile;
  },

  // Update profile
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("user_profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return null;
    }
    return data;
  },

  // Update language preference
  async updateLanguage(userId: string, language: string): Promise<boolean> {
    const { error } = await supabase
      .from("user_profiles")
      .update({ language, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating language:", error);
      return false;
    }
    return true;
  },

  // Update location
  async updateLocation(userId: string, location: string): Promise<boolean> {
    const { error } = await supabase
      .from("user_profiles")
      .update({ location, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating location:", error);
      return false;
    }
    return true;
  },

  // Update main crops
  async updateMainCrops(userId: string, mainCrops: string[]): Promise<boolean> {
    const { error } = await supabase
      .from("user_profiles")
      .update({ main_crops: mainCrops, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating main crops:", error);
      return false;
    }
    return true;
  },

  // Update preferences
  async updatePreferences(userId: string, preferences: any): Promise<boolean> {
    const { error } = await supabase
      .from("user_profiles")
      .update({ preferences, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating preferences:", error);
      return false;
    }
    return true;
  },
};
