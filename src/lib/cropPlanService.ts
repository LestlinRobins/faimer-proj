import { supabase } from "./supabase";
import type { CropPlan } from "./supabase";

export const cropPlanService = {
  // Get all crop plans for a user
  async getUserCropPlans(userId: string): Promise<CropPlan[]> {
    const { data, error } = await supabase
      .from("crop_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching crop plans:", error);
      return [];
    }
    return data || [];
  },

  // Add new crop plan
  async addCropPlan(plan: Omit<CropPlan, "id" | "created_at" | "updated_at">): Promise<CropPlan | null> {
    const { data, error } = await supabase
      .from("crop_plans")
      .insert([plan])
      .select()
      .single();

    if (error) {
      console.error("Error adding crop plan:", error);
      throw error;
    }

    // Log activity
    await logActivity(plan.user_id, "crop_plan", "New Crop Plan Created", `Created plan for ${plan.crop_name}`);

    return data;
  },

  // Update crop plan
  async updateCropPlan(id: string, updates: Partial<CropPlan>): Promise<CropPlan | null> {
    const { data, error } = await supabase
      .from("crop_plans")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating crop plan:", error);
      throw error;
    }
    return data;
  },

  // Delete crop plan
  async deleteCropPlan(id: string): Promise<boolean> {
    const { error } = await supabase.from("crop_plans").delete().eq("id", id);

    if (error) {
      console.error("Error deleting crop plan:", error);
      return false;
    }
    return true;
  },

  // Get active crop plans
  async getActiveCropPlans(userId: string): Promise<CropPlan[]> {
    const { data, error } = await supabase
      .from("crop_plans")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["planning", "planted", "growing"])
      .order("planting_date", { ascending: true });

    if (error) {
      console.error("Error fetching active crop plans:", error);
      return [];
    }
    return data || [];
  },

  // Update crop plan status
  async updateCropStatus(id: string, status: string): Promise<boolean> {
    const { error } = await supabase
      .from("crop_plans")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error updating crop status:", error);
      return false;
    }
    return true;
  },
};

async function logActivity(
  userId: string,
  activityType: string,
  title: string,
  description?: string
): Promise<void> {
  try {
    await supabase.from("activity_history").insert([
      {
        user_id: userId,
        activity_type: activityType,
        title,
        description,
      },
    ]);
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}
