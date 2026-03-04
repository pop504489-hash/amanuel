/**
 * @fileOverview An AI agent for providing inventory reorder suggestions.
 * 
 * Stubbed for static Capacitor build.
 */

import { z } from 'zod';

const InventoryReorderSuggestionInputSchema = z.object({
  pastOrders: z.array(z.any()),
  periodInDays: z.number(),
});
export type InventoryReorderSuggestionInput = z.infer<typeof InventoryReorderSuggestionInputSchema>;

const InventoryReorderSuggestionOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      suggestedQuantity: z.number(),
      reason: z.string(),
    })
  ),
});
export type InventoryReorderSuggestionOutput = z.infer<typeof InventoryReorderSuggestionOutputSchema>;

/**
 * Returns an empty array for offline static mode.
 */
export async function inventoryReorderSuggestion(input: InventoryReorderSuggestionInput): Promise<InventoryReorderSuggestionOutput> {
  return {
    suggestions: []
  };
}
