/**
 * Offline Navigation Matcher using Transformer Embeddings
 * Uses @xenova/transformers with all-MiniLM-L6-v2 model for semantic similarity matching
 * Provides fallback navigation when API is unavailable or network is offline
 *
 * UPDATED: Now uses sentence-based examples instead of keyword lists for better semantic understanding
 */

import { pipeline } from "@xenova/transformers";
import { EXAMPLE_ROUTES } from "./offlineMatcherExamples";

// Route data with natural language examples for embedding
export interface RouteData {
  id: string;
  title: string;
  examples: string; // Natural language sentences representing user queries
  subAction?: string;
  action?: "navigate" | "weather" | "chat";
}

// Use the example-based routes from the separate file
export const ROUTES: RouteData[] = EXAMPLE_ROUTES;

// Global embedding model instance
let embeddingModel: any = null;
let routeEmbeddings: Float32Array[] = [];
let isInitialized = false;

/**
 * Initialize the embedding model and pre-compute route embeddings
 * This should be called on app startup
 */
export async function initializeOfflineMatcher(): Promise<void> {
  if (isInitialized) {
    console.log("✅ Offline matcher already initialized");
    return;
  }

  try {
    console.log("🔄 Initializing offline matcher with embeddings...");

    // Load the sentence transformer model
    embeddingModel = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    console.log("✅ Embedding model loaded successfully");

    // Pre-compute embeddings for all routes
    console.log(`🔄 Computing embeddings for ${ROUTES.length} routes...`);
    routeEmbeddings = [];

    for (const route of ROUTES) {
      const embedding = await computeEmbedding(route.examples);
      routeEmbeddings.push(embedding);
    }

    isInitialized = true;
    console.log(
      `✅ Offline matcher initialized with ${routeEmbeddings.length} route embeddings`
    );
  } catch (error) {
    console.error("❌ Failed to initialize offline matcher:", error);
    isInitialized = false;
    throw error;
  }
}

/**
 * Compute embedding for a text string
 */
async function computeEmbedding(text: string): Promise<Float32Array> {
  if (!embeddingModel) {
    throw new Error("Embedding model not initialized");
  }

  try {
    const output = await embeddingModel(text, {
      pooling: "mean",
      normalize: true,
    });

    // Convert to Float32Array for efficient computation
    return new Float32Array(output.data);
  } catch (error) {
    console.error("❌ Error computing embedding:", error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two embedding vectors
 */
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find the best matching route for a user query using semantic similarity
 */
export async function findBestRoute(
  query: string,
  language?: string
): Promise<{
  route: RouteData;
  similarity: number;
  confidence: number;
}> {
  if (!isInitialized || !embeddingModel) {
    throw new Error(
      "Offline matcher not initialized. Call initializeOfflineMatcher() first."
    );
  }

  try {
    // Normalize query
    const normalizedQuery = query.toLowerCase().trim();
    console.log(`🔍 Finding best route for: "${normalizedQuery}"`);

    // Compute embedding for the query
    const queryEmbedding = await computeEmbedding(normalizedQuery);

    // Calculate similarity with all routes
    let bestMatch = {
      index: -1,
      similarity: -1,
    };

    for (let i = 0; i < routeEmbeddings.length; i++) {
      const similarity = cosineSimilarity(queryEmbedding, routeEmbeddings[i]);

      if (similarity > bestMatch.similarity) {
        bestMatch = {
          index: i,
          similarity,
        };
      }
    }

    if (bestMatch.index === -1) {
      // Fallback to chatbot if no match found
      console.log("⚠️ No semantic match found, falling back to chatbot");
      return {
        route: {
          id: "chatbot",
          title: "AI Assistant",
          examples: "",
          action: "chat",
        },
        similarity: 0,
        confidence: 0.3,
      };
    }

    const matchedRoute = ROUTES[bestMatch.index];

    // Convert similarity to confidence (0-1 scale)
    // Cosine similarity ranges from -1 to 1, but for text it's typically 0 to 1
    const confidence = Math.max(0, Math.min(1, bestMatch.similarity));

    console.log(
      `✅ Best match: ${matchedRoute.title} (similarity: ${bestMatch.similarity.toFixed(3)}, confidence: ${confidence.toFixed(2)})`
    );

    return {
      route: matchedRoute,
      similarity: bestMatch.similarity,
      confidence,
    };
  } catch (error) {
    console.error("❌ Error finding best route:", error);

    // Fallback to chatbot on error
    return {
      route: {
        id: "chatbot",
        title: "AI Assistant",
        examples: "",
        action: "chat",
      },
      similarity: 0,
      confidence: 0.3,
    };
  }
}

/**
 * Get initialization status
 */
export function getMatcherStatus(): {
  initialized: boolean;
  routeCount: number;
  embeddingCount: number;
} {
  return {
    initialized: isInitialized,
    routeCount: ROUTES.length,
    embeddingCount: routeEmbeddings.length,
  };
}

/**
 * Cleanup resources (optional, for when the app is closing)
 */
export function cleanupOfflineMatcher(): void {
  embeddingModel = null;
  routeEmbeddings = [];
  isInitialized = false;
  console.log("🧹 Offline matcher resources cleaned up");
}
