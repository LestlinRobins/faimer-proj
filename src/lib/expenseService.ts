import { supabase } from "./supabase";
import type { Expense, ActivityHistory } from "./supabase";

export const expenseService = {
  // Get all expenses for a user
  async getUserExpenses(userId: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching expenses:", error);
      return [];
    }
    return data || [];
  },

  // Add new expense
  async addExpense(expense: Omit<Expense, "id" | "created_at" | "updated_at">): Promise<Expense | null> {
    const { data, error } = await supabase
      .from("expenses")
      .insert([expense])
      .select()
      .single();

    if (error) {
      console.error("Error adding expense:", error);
      throw error;
    }

    // Log activity
    await logActivity(expense.user_id, "expense", "New Expense Added", `Added expense: ${expense.description}`);

    return data;
  },

  // Update expense
  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense | null> {
    const { data, error } = await supabase
      .from("expenses")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
    return data;
  },

  // Delete expense
  async deleteExpense(id: string): Promise<boolean> {
    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) {
      console.error("Error deleting expense:", error);
      return false;
    }
    return true;
  },

  // Get expenses by date range
  async getExpensesByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Expense[]> {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching expenses by date:", error);
      return [];
    }
    return data || [];
  },

  // Get expense summary by category
  async getExpenseSummary(userId: string): Promise<{ category: string; total: number }[]> {
    const expenses = await this.getUserExpenses(userId);
    const summary = expenses.reduce((acc, expense) => {
      const existing = acc.find((item) => item.category === expense.category);
      if (existing) {
        existing.total += expense.amount;
      } else {
        acc.push({ category: expense.category, total: expense.amount });
      }
      return acc;
    }, [] as { category: string; total: number }[]);

    return summary.sort((a, b) => b.total - a.total);
  },
};

// Helper function to log activity
async function logActivity(
  userId: string,
  activityType: string,
  title: string,
  description?: string,
  metadata?: any
): Promise<void> {
  try {
    await supabase.from("activity_history").insert([
      {
        user_id: userId,
        activity_type: activityType,
        title,
        description,
        metadata,
      },
    ]);
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}
