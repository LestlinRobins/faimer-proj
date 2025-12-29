import { supabase } from "./supabase";
import type { FairFarmProduct, FairFarmTransaction } from "./supabase";

// Simple blockchain-like hash function//newcomment 
function generateBlockchainHash(data: string): string {
  const timestamp = Date.now();
  const combined = data + timestamp;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `0x${Math.abs(hash).toString(16)}${timestamp.toString(16)}`;
}

export const fairFarmService = {
  // Get all products
  async getAllProducts(): Promise<FairFarmProduct[]> {
    const { data, error } = await supabase
      .from("fairfarm_products")
      .select("*")
      .eq("in_stock", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }
    return data || [];
  },

  // Search products by category
  async searchByCategory(category: string): Promise<FairFarmProduct[]> {
    const { data, error } = await supabase
      .from("fairfarm_products")
      .select("*")
      .eq("category", category)
      .eq("in_stock", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching by category:", error);
      return [];
    }
    return data || [];
  },

  // Search products by name
  async searchByName(searchTerm: string): Promise<FairFarmProduct[]> {
    const { data, error } = await supabase
      .from("fairfarm_products")
      .select("*")
      .ilike("product_name", `%${searchTerm}%`)
      .eq("in_stock", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching by name:", error);
      return [];
    }
    return data || [];
  },

  // Get user's products
  async getUserProducts(userId: string): Promise<FairFarmProduct[]> {
    const { data, error } = await supabase
      .from("fairfarm_products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user products:", error);
      return [];
    }
    return data || [];
  },

  // Add new product
  async addProduct(
    product: Omit<
      FairFarmProduct,
      "id" | "rating" | "reviews" | "blockchain_hash" | "created_at" | "updated_at"
    >
  ): Promise<FairFarmProduct | null> {
    // Generate blockchain hash
    const blockchainHash = generateBlockchainHash(
      `${product.farmer_name}-${product.product_name}-${product.price}`
    );

    const { data, error } = await supabase
      .from("fairfarm_products")
      .insert([
        {
          ...product,
          blockchain_hash: blockchainHash,
          rating: 0,
          reviews: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding product:", error);
      throw error;
    }
    return data;
  },

  // Update product
  async updateProduct(
    id: string,
    updates: Partial<FairFarmProduct>
  ): Promise<FairFarmProduct | null> {
    const { data, error } = await supabase
      .from("fairfarm_products")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      return null;
    }
    return data;
  },

  // Delete product
  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase.from("fairfarm_products").delete().eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      return false;
    }
    return true;
  },

  // Create transaction
  async createTransaction(
    transaction: Omit<FairFarmTransaction, "id" | "blockchain_hash" | "created_at" | "completed_at">
  ): Promise<FairFarmTransaction | null> {
    // Generate blockchain hash for transaction
    const blockchainHash = generateBlockchainHash(
      `${transaction.buyer_name}-${transaction.seller_user_id}-${transaction.amount}`
    );

    const { data, error } = await supabase
      .from("fairfarm_transactions")
      .insert([
        {
          ...transaction,
          blockchain_hash: blockchainHash,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
    return data;
  },

  // Get user transactions (as buyer)
  async getUserTransactions(userId: string): Promise<FairFarmTransaction[]> {
    const { data, error } = await supabase
      .from("fairfarm_transactions")
      .select("*")
      .eq("buyer_user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user transactions:", error);
      return [];
    }
    return data || [];
  },

  // Get seller transactions
  async getSellerTransactions(userId: string): Promise<FairFarmTransaction[]> {
    const { data, error } = await supabase
      .from("fairfarm_transactions")
      .select("*")
      .eq("seller_user_id", userId)
      .order("created_at", { ascending: false});

    if (error) {
      console.error("Error fetching seller transactions:", error);
      return [];
    }
    return data || [];
  },

  // Update transaction status
  async updateTransactionStatus(
    id: string,
    status: string
  ): Promise<boolean> {
    const updates: any = { status };
    if (status === "completed") {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("fairfarm_transactions")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating transaction status:", error);
      return false;
    }
    return true;
  },

  // Get all transactions (for transparency)
  async getAllTransactions(): Promise<FairFarmTransaction[]> {
    const { data, error } = await supabase
      .from("fairfarm_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching all transactions:", error);
      return [];
    }
    return data || [];
  },
};
