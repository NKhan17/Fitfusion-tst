'use server';
/**
 * @fileOverview Outfit suggestion flow based on mood, event, and weather.
 *
 * - suggestOutfit - A function that suggests an outfit based on mood, event, and weather.
 * - SuggestOutfitInput - The input type for the suggestOutfit function.
 * - SuggestOutfitOutput - The return type for the suggestOutfit function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOutfitInputSchema = z.object({
  mood: z.string().describe('The user\'s mood (e.g., happy, moody, calm).'),
  event: z.string().describe('The event the user is attending (e.g., date, exam, hangout).'),
  weather: z.string().describe('The current weather conditions (e.g., sunny, rainy, cold).'),
  wardrobe: z.string().describe('A JSON string representing the user\'s wardrobe, with categories like tops, bottoms, layers, accessories, and footwear.'),
});
export type SuggestOutfitInput = z.infer<typeof SuggestOutfitInputSchema>;

const SuggestOutfitOutputSchema = z.object({
  outfitName: z.string().describe('The name of the suggested outfit.'),
  moodTag: z.string().describe('The mood tag associated with the outfit.'),
  explanation: z.string().describe('An explanation of why the outfit works for the given mood, event, and weather.'),
  // Placeholder for product image links.
  productLinks: z.array(z.string()).optional().describe('Optional array of product image links from online stores.'),
});
export type SuggestOutfitOutput = z.infer<typeof SuggestOutfitOutputSchema>;

export async function suggestOutfit(input: SuggestOutfitInput): Promise<SuggestOutfitOutput> {
  return suggestOutfitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOutfitPrompt',
  input: {schema: SuggestOutfitInputSchema},
  output: {schema: SuggestOutfitOutputSchema},
  prompt: `You are a personal stylist with a keen eye for trends, drawing inspiration from Pinterest. Suggest an outfit based on the user's mood, the event they are attending, and the current weather.

  Mood: {{mood}}
  Event: {{event}}
  Weather: {{weather}}
  Wardrobe: {{wardrobe}}

  Consider the provided wardrobe to create a stylish and appropriate outfit. Your suggestions should feel like they're straight from a trending Pinterest board. The wardrobe is a JSON string. Return an outfit name, mood tag, and a fun explanation of why the outfit works, referencing Pinterest trends. If possible, return product links to representative fashion items from online stores.
  `,
});

const suggestOutfitFlow = ai.defineFlow(
  {
    name: 'suggestOutfitFlow',
    inputSchema: SuggestOutfitInputSchema,
    outputSchema: SuggestOutfitOutputSchema,
  },
  async input => {
    try {
      // Parse the wardrobe string into a JSON object
      const wardrobe = JSON.parse(input.wardrobe);

      // Now you can use the wardrobe object in your prompt or logic
      const {output} = await prompt({...input, wardrobe: JSON.stringify(wardrobe)});
      return output!;
    } catch (error) {
      console.error('Error parsing wardrobe JSON:', error);
      throw new Error('Invalid wardrobe JSON format.');
    }
  }
);
