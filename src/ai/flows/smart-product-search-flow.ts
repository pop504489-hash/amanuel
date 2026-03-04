/**
 * @fileOverview An AI agent for smart natural language product search.
 * 
 * Stubbed for static Capacitor build.
 */

import { z } from 'zod';

const SmartProductSearchInputSchema = z.object({
  query: z.string(),
  availableProducts: z.array(z.any()),
});
export type SmartProductSearchInput = z.infer<typeof SmartProductSearchInputSchema>;

const SmartProductSearchOutputSchema = z.object({
  foundProducts: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number().optional(),
    })
  ),
});
export type SmartProductSearchOutput = z.infer<typeof SmartProductSearchOutputSchema>;

/**
 * Returns empty results for offline static mode.
 */
export async function smartProductSearch(input: SmartProductSearchInput): Promise<SmartProductSearchOutput> {
  return {
    foundProducts: []
  };
}
