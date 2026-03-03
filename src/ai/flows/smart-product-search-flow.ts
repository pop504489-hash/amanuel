'use server';
/**
 * @fileOverview An AI agent for smart natural language product search.
 *
 * - smartProductSearch - A function that handles natural language product queries.
 * - SmartProductSearchInput - The input type for the smartProductSearch function.
 * - SmartProductSearchOutput - The return type for the smartProductSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductSchema = z.object({
  id: z.string().describe('The unique identifier of the product.'),
  name: z.string().describe('The name of the product.'),
  description: z.string().optional().describe('A brief description of the product.'),
});

const SmartProductSearchInputSchema = z.object({
  query: z.string().describe('The natural language query from the user (e.g., "I need 2 crates of soft drinks").'),
  availableProducts: z.array(ProductSchema).describe('A list of products available in the catalog.'),
});
export type SmartProductSearchInput = z.infer<typeof SmartProductSearchInputSchema>;

const SmartProductSearchOutputSchema = z.object({
  foundProducts: z.array(
    z.object({
      id: z.string().describe('The ID of the identified product from the availableProducts list.'),
      name: z.string().describe('The name of the identified product.'),
      quantity: z.number().optional().describe('The requested quantity of the product, if specified in the query.'),
    })
  ).describe('A list of products identified from the query, including their IDs, names, and optional quantities.'),
});
export type SmartProductSearchOutput = z.infer<typeof SmartProductSearchOutputSchema>;

export async function smartProductSearch(input: SmartProductSearchInput): Promise<SmartProductSearchOutput> {
  return smartProductSearchFlow(input);
}

const smartProductSearchPrompt = ai.definePrompt({
  name: 'smartProductSearchPrompt',
  input: {schema: SmartProductSearchInputSchema},
  output: {schema: SmartProductSearchOutputSchema},
  prompt: `You are an intelligent assistant for a B2B ordering platform. Your task is to interpret a shop owner's natural language request for products and identify the specific products and their quantities from a given list of available products.

Here is the list of available products:
{{#each availableProducts}}
- ID: {{this.id}}, Name: {{this.name}}, Description: {{this.description}}
{{/each}}

User's Request: "{{{query}}}"

Instructions:
1. Identify all product names and any specified quantities from the "User's Request".
2. Match the identified products against the "availableProducts" list based on name and description. Use the product ID and name from the availableProducts list in your output.
3. If a quantity is specified for a product in the request, include it in the 'quantity' field. If no quantity is specified, omit the 'quantity' field for that product.
4. If a product in the request cannot be clearly matched to an available product, do not include it in the 'foundProducts' array.
5. Provide the output in JSON format, strictly adhering to the output schema. Only output the JSON object, nothing else.`,
});

const smartProductSearchFlow = ai.defineFlow(
  {
    name: 'smartProductSearchFlow',
    inputSchema: SmartProductSearchInputSchema,
    outputSchema: SmartProductSearchOutputSchema,
  },
  async (input) => {
    const {output} = await smartProductSearchPrompt(input);
    return output!;
  }
);
