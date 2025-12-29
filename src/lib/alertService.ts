import { supabase } from "./supabase";
import type { UserAlert } from "./supabase";

export const alertService = {
  // Get user alerts
  async getUserAlerts(userId: string): Promise<UserAlert[]> {
    const { data, error } = await supabase
      .from("user_alerts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching alerts:", error);
      return [];
    }
    return data || [];
  },

  // Get unread alerts
  async getUnreadAlerts(userId: string): Promise<UserAlert[]> {
    const { data, error } = await supabase
      .from("user_alerts")
      .select("*")
      .eq("user_id", userId)
      .eq("is_read", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching unread alerts:", error);
      return [];
    }
    return data || [];
  },

  // Create alert
  async createAlert(alert: Omit<UserAlert, "id" | "created_at">): Promise<UserAlert | null> {
    const { data, error} = await supabase
      .from("user_alerts")
      .insert([alert])
      .select()
      .single();

    if (error) {
      console.error("Error creating alert:", error);
      return null;
    }
    return data;
  },

  // Mark alert as read
  async markAsRead(alertId: string): Promise<boolean> {
    const { error } = await supabase
      .from("user_alerts")
      .update({ is_read: true })
      .eq("id", alertId);

    if (error) {
      console.error("Error marking alert as read:", error);
      return false;
    }
    return true;
  },

  // Mark all alerts as read
  async markAllAsRead(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from("user_alerts")
      .update({ is_read: true })
      .eq("user_id", userId);

    if (error) {
      console.error("Error marking all alerts as read:", error);
      return false;
    }
    return true;
  },

  // Delete expired alerts
  async deleteExpiredAlerts(): Promise<number> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("user_alerts")
      .delete()
      .lt("expires_at", now)
      .select();

    if (error) {
      console.error("Error deleting expired alerts:", error);
      return 0;
    }
    return data?.length || 0;
  },

  // Generate weather alert
  async generateWeatherAlert(
    userId: string,
    weatherData: any,
    userCrops: string[]
  ): Promise<void> {
    // Check for extreme weather conditions
    if (weatherData.temperature > 40) {
      await this.createAlert({
        user_id: userId,
        alert_type: "weather",
        title: "Extreme Heat Alert",
        message: `Temperature expected to reach ${weatherData.temperature}°C. Increase irrigation for your crops.`,
        severity: "high",
        is_read: false,
        crop: userCrops.join(", "),
      });
    }

    if (weatherData.rainfall > 50) {
      await this.createAlert({
        user_id: userId,
        alert_type: "weather",
        title: "Heavy Rainfall Alert",
        message: `Heavy rainfall (${weatherData.rainfall}mm) expected. Ensure proper drainage.`,
        severity: "high",
        is_read: false,
        crop: userCrops.join(", "),
      });
    }
  },

  // Generate pest alert based on weather
  async generatePestAlert(
    userId: string,
    crop: string,
    conditions: { temperature: number; humidity: number }
  ): Promise<void> {
    // High humidity can lead to fungal diseases
    if (conditions.humidity > 80 && conditions.temperature > 25) {
      await this.createAlert({
        user_id: userId,
        alert_type: "pest",
        title: "High Fungal Disease Risk",
        message: `High humidity and temperature create ideal conditions for fungal diseases in ${crop}. Apply preventive fungicides.`,
        severity: "medium",
        is_read: false,
        crop,
      });
    }
  },

  // Generate irrigation reminder
  async generateIrrigationReminder(
    userId: string,
    crop: string,
    lastIrrigationDate: Date
  ): Promise<void> {
    const daysSinceIrrigation = Math.floor(
      (Date.now() - lastIrrigationDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceIrrigation >= 3) {
      await this.createAlert({
        user_id: userId,
        alert_type: "irrigation",
        title: "Irrigation Reminder",
        message: `It's been ${daysSinceIrrigation} days since last irrigation for ${crop}. Check soil moisture.`,
        severity: "low",
        is_read: false,
        crop,
      });
    }
  },
};
