/**
 * @fileOverview A bilingual Smart Business Advisor for shop owners.
 *
 * - businessAdvisor - Handles natural language ordering and business consulting.
 * - BusinessAdvisorInput - The input type including query and catalog context.
 * - BusinessAdvisorOutput - The response text and identified line items.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductContextSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameAm: z.string(),
  category: z.string(),
  price: z.number(),
});

const BusinessAdvisorInputSchema = z.object({
  query: z.string().describe('The user\'s message in Amharic or English.'),
  availableProducts: z.array(ProductContextSchema).describe('The current inventory catalog.'),
  language: z.enum(['en', 'am']).default('en'),
});
export type BusinessAdvisorInput = z.infer<typeof BusinessAdvisorInputSchema>;

const BusinessAdvisorOutputSchema = z.object({
  response: z.string().describe('The AI\'s natural language response to the user.'),
  identifiedItems: z.array(
    z.object({
      productId: z.string().describe('The ID of the product from the catalog.'),
      quantity: z.number().optional().describe('The requested quantity.'),
    })
  ).optional().describe('Items identified for ordering.'),
});
export type BusinessAdvisorOutput = z.infer<typeof BusinessAdvisorOutputSchema>;

export async function businessAdvisor(input: BusinessAdvisorInput): Promise<BusinessAdvisorOutput> {
  return businessAdvisorFlow(input);
}

const businessAdvisorPrompt = ai.definePrompt({
  name: 'businessAdvisorPrompt',
  input: {schema: BusinessAdvisorInputSchema},
  output: {schema: BusinessAdvisorOutputSchema},
  prompt: `You are a Smart Business Advisor for a B2B wholesale platform. Your goal is to help shop owners (kiosks) manage their inventory and grow their business.

Available Inventory:
{{#each availableProducts}}
- ID: {{id}}, Name: {{name}} ({{nameAm}}), Category: {{category}}, Price: ETB {{price}}
{{/each}}

User's Message: "{{{query}}}"
Language Preference: {{language}}

Role Instructions:
1. If the user wants to order products, identify the matching products from the inventory and specify quantities.
2. If the user asks for business advice (e.g., trends, sales tips), provide professional and encouraging advice.
3. If the language is 'am', respond primarily in Amharic. If 'en', respond in English.
4. Be concise, helpful, and friendly.
5. If you identify items to order, include them in the 'identifiedItems' array.
6. Always provide a text 'response'.`,
});

const businessAdvisorFlow = ai.defineFlow(
  {
    name: 'businessAdvisorFlow',
    inputSchema: BusinessAdvisorInputSchema,
    outputSchema: BusinessAdvisorOutputSchema,
  },
  async (input) => {
    const {output} = await businessAdvisorPrompt(input);
    return output!;
  }
);