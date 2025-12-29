import { supabase } from "./supabase";
import type { AgricultureNews } from "./supabase";

export const newsService = {
  // Get cached news
  async getCachedNews(limit: number = 10): Promise<AgricultureNews[]> {
    const { data, error } = await supabase
      .from("agriculture_news")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching cached news:", error);
      return [];
    }
    return data || [];
  },

  // Add news to cache
  async cacheNews(news: Omit<AgricultureNews, "id" | "created_at">): Promise<AgricultureNews | null> {
    const { data, error } = await supabase
      .from("agriculture_news")
      .insert([news])
      .select()
      .single();

    if (error) {
      console.error("Error caching news:", error);
      return null;
    }
    return data;
  },

  // Fetch fresh news from external API/RSS
  async fetchFreshNews(): Promise<AgricultureNews[]> {
    try {
      // TODO: Integrate with actual news API (e.g., NewsAPI, RSS feeds)
      // For now, returning empty array
      console.log("News API integration needed");
      return [];
    } catch (error) {
      console.error("Error fetching fresh news:", error);
      return [];
    }
  },

  // Get news by category
  async getNewsByCategory(category: string): Promise<AgricultureNews[]> {
    const { data, error } = await supabase
      .from("agriculture_news")
      .select("*")
      .eq("category", category)
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching news by category:", error);
      return [];
    }
    return data || [];
  },

  // Clean old news (keep only last 30 days)
  async cleanOldNews(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("agriculture_news")
      .delete()
      .lt("published_at", thirtyDaysAgo.toISOString())
      .select();

    if (error) {
      console.error("Error cleaning old news:", error);
      return 0;
    }
    return data?.length || 0;
  },
};
