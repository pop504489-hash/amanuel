/**
 * @fileOverview A bilingual Smart Business Advisor for shop owners.
 * 
 * Stubbed for static Capacitor build to prevent Node.js module conflicts.
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

/**
 * Returns a localized offline message.
 */
export async function businessAdvisor(input: BusinessAdvisorInput): Promise<BusinessAdvisorOutput> {
  return {
    response: input.language === 'am' 
      ? "ይቅርታ፣ ረዳቱ በአሁኑ ጊዜ ከመስመር ውጭ ነው። እባክዎ ኢንተርኔትዎን ያረጋግጡ።" 
      : "I'm sorry, the advisor is currently offline. Please check your connection.",
    identifiedItems: []
  };
}
