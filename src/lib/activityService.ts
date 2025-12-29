import { supabase } from "./supabase";
import type { ActivityHistory } from "./supabase";

export const activityService = {
  // Get user activity history tagvhange
  //newchante
  async getUserHistory(userId: string, limit: number = 50): Promise<ActivityHistory[]> {
    const { data, error } = await supabase
      .from("activity_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching history:", error);
      return [];
    }
    return data || [];
  },

  // Get history by type
  async getHistoryByType(userId: string, activityType: string): Promise<ActivityHistory[]> {
    const { data, error } = await supabase
      .from("activity_history")
      .select("*")
      .eq("user_id", userId)
      .eq("activity_type", activityType)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching history by type:", error);
      return [];
    }
    return data || [];
  },

  // Log activity
  async logActivity(
    userId: string,
    activityType: string,
    title: string,
    description?: string,
    metadata?: any
  ): Promise<ActivityHistory | null> {
    const { data, error } = await supabase
      .from("activity_history")
      .insert([
        {
          user_id: userId,
          activity_type: activityType,
          title,
          description,
          metadata,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error logging activity:", error);
      return null;
    }
    return data;
  },

  // Get recent activities (last 7 days)
  async getRecentActivities(userId: string): Promise<ActivityHistory[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from("activity_history")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching recent activities:", error);
      return [];
    }
    return data || [];
  },

  // Get activity stats
  async getActivityStats(userId: string): Promise<{ [key: string]: number }> {
    const activities = await this.getUserHistory(userId);
    const stats = activities.reduce((acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return stats;
  },
};
