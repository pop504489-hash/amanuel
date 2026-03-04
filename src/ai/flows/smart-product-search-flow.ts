/**
 * @fileOverview An AI agent for smart natural language product search.
 * 
 * Note: AI logic commented out for static Capacitor build.
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

export async function smartProductSearch(input: SmartProductSearchInput): Promise<SmartProductSearchOutput> {
  // Mock response for static build
  return {
    foundProducts: []
  };
}

// Genkit implementation commented out for static build
/*
import {ai} from '@/ai/genkit';
const smartProductSearchPrompt = ai.definePrompt({ ... });
const smartProductSearchFlow = ai.defineFlow({ ... });
*/
