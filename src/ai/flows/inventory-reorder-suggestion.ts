/**
 * @fileOverview An AI agent for providing inventory reorder suggestions.
 *
 * - inventoryReorderSuggestion - A function that handles the reorder suggestion process.
 * - InventoryReorderSuggestionInput - The input type for the inventoryReorderSuggestion function.
 * - InventoryReorderSuggestionOutput - The return type for the inventoryReorderSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InventoryReorderSuggestionInputSchema = z.object({
  pastOrders: z
    .array(
      z.object({
        orderId: z.string().describe('Unique identifier for the order.'),
        orderDate: z.string().describe('The date the order was placed (ISO format).'),
        items: z
          .array(
            z.object({
              productId: z.string().describe('Unique identifier for the product.'),
              productName: z.string().describe('Name of the product.'),
              quantity: z.number().describe('Quantity of the product ordered.'),
            })
          )
          .describe('List of items in the order.'),
      })
    )
    .describe('A list of past orders, including details of items purchased.'),
  periodInDays: z
    .number()
    .describe('The number of past days to consider for the reorder suggestion.'),
});
export type InventoryReorderSuggestionInput = z.infer<
  typeof InventoryReorderSuggestionInputSchema
>;

const InventoryReorderSuggestionOutputSchema = z.object({
  suggestions: z
    .array(
      z.object({
        productId: z.string().describe('Unique identifier for the product.'),
        productName: z.string().describe('Name of the product.'),
        suggestedQuantity: z
          .number()
          .describe('The recommended quantity to reorder for this product.'),
        reason: z
          .string()
          .describe('A brief explanation for the reorder suggestion.'),
      })
    )
    .describe('A list of reorder suggestions for various products.'),
});
export type InventoryReorderSuggestionOutput = z.infer<
  typeof InventoryReorderSuggestionOutputSchema
>;

export async function inventoryReorderSuggestion(
  input: InventoryReorderSuggestionInput
): Promise<InventoryReorderSuggestionOutput> {
  return inventoryReorderSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'inventoryReorderSuggestionPrompt',
  input: {schema: InventoryReorderSuggestionInputSchema},
  output: {schema: InventoryReorderSuggestionOutputSchema},
  prompt: `You are an expert inventory manager for a B2B ordering platform. Your task is to analyze past purchasing patterns and provide simple reorder suggestions for products.

Based on the provided past order data for the last {{{periodInDays}}} days, suggest reorder quantities for products. Focus on popular items that show consistent purchasing, and provide a clear, concise reason for each suggestion.

Past Orders:
{{#each pastOrders}}
Order ID: {{{orderId}}}, Date: {{{orderDate}}}
Items:
{{#each items}}
  - Product ID: {{{productId}}}, Name: {{{productName}}}, Quantity: {{{quantity}}}
{{/each}}
---
{{/each}}

Provide the suggestions in the specified JSON format.`,
});

const inventoryReorderSuggestionFlow = ai.defineFlow(
  {
    name: 'inventoryReorderSuggestionFlow',
    inputSchema: InventoryReorderSuggestionInputSchema,
    outputSchema: InventoryReorderSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('No output received from the reorder suggestion prompt.');
    }
    return output;
  }
);
