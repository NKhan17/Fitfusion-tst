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
  mood: z.string().describe("The user's mood (e.g., happy, moody, calm)."),
  event: z.string().describe('The event the user is attending (e.g., date, exam, hangout).'),
  weather: z.string().describe('The current weather conditions (e.g., sunny, rainy, cold).'),
  wardrobe: z.string().describe("A JSON string representing the user's wardrobe, with categories like tops, bottoms, layers, accessories, and footwear."),
});
export type SuggestOutfitInput = z.infer<typeof SuggestOutfitInputSchema>;

const SuggestOutfitOutputSchema = z.object({
  outfitName: z.string().describe('The name of the suggested outfit.'),
  moodTag: z.string().describe('The mood tag associated with the outfit.'),
  explanation: z.string().describe('An explanation of why the outfit works for the given mood, event, and weather.'),
  items: z.array(z.object({
    category: z.string().describe('The category of the item (e.g., Top, Bottom, Footwear, Accessory).'),
    description: z.string().describe('A detailed description of the clothing item for image generation, inspired by Pinterest aesthetics.'),
  })).describe('An array of 4 outfit items (Top, Bottom, Footwear, Accessory) with descriptions.'),
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

  Consider the provided wardrobe to create a stylish and appropriate outfit. Your suggestions should feel like they're straight from a trending Pinterest board. The wardrobe is a JSON string.
  
  Return an outfit name, a mood tag, and a fun explanation of why the outfit works, referencing Pinterest trends.
  
  Most importantly, provide a list of exactly 4 items for the outfit in this order: Top, Bottom, Footwear, and Accessory. For each item, provide a detailed, visually-rich description suitable for an image generation model. The description should capture the Pinterest aesthetic.
  `,
});

const suggestOutfitFlow = ai.defineFlow(
  {
    name: 'suggestOutfitFlow',
    inputSchema: SuggestOutfitInputSchema,
    outputSchema: SuggestOutfitOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The model did not return a valid outfit suggestion.');
    }
    return output;
  }
);
