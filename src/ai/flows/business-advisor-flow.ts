/**
 * @fileOverview A bilingual Smart Business Advisor for shop owners.
 * 
 * Note: AI logic commented out for static Capacitor build.
 */

import { z } from 'zod';

const ProductContextSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameAm: z.string(),
  category: z.string(),
  price: z.number(),
});

const BusinessAdvisorInputSchema = z.object({
  query: z.string(),
  availableProducts: z.array(ProductContextSchema),
  language: z.enum(['en', 'am']).default('en'),
});
export type BusinessAdvisorInput = z.infer<typeof BusinessAdvisorInputSchema>;

const BusinessAdvisorOutputSchema = z.object({
  response: z.string(),
  identifiedItems: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().optional(),
    })
  ).optional(),
});
export type BusinessAdvisorOutput = z.infer<typeof BusinessAdvisorOutputSchema>;

export async function businessAdvisor(input: BusinessAdvisorInput): Promise<BusinessAdvisorOutput> {
  // Mock response for static build
  return {
    response: input.language === 'am' 
      ? "ይቅርታ፣ ረዳቱ በአሁኑ ጊዜ ከመስመር ውጭ ነው።" 
      : "I'm sorry, the advisor is currently offline.",
    identifiedItems: []
  };
}

// Genkit implementation commented out for static build
/*
import {ai} from '@/ai/genkit';
import {ai as genkitAi} from 'genkit';

const businessAdvisorPrompt = ai.definePrompt({ ... });
const businessAdvisorFlow = ai.defineFlow({ ... });
*/
