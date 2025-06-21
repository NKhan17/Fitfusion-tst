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
  prompt: `You are an elite personal stylist and trend forecaster, with a deep understanding of how clothing creates a vibe. Your aesthetic is heavily influenced by the chic, curated, and visually stunning world of Pinterest. Your task is to craft the perfect outfit from a given wardrobe based on the user's mood, the specific event, and the weather.

  **Crucial Inputs:**
  - **Mood:** {{mood}}
  - **Event:** {{event}}
  - **Weather:** {{weather}} (This is critical. A 'sunny' day can be hot or cold. Use the description to make a sensible temperature assumption. For example, 'sunny and warm', 'cold and rainy', 'chilly breeze'. The outfit MUST be practical for the weather.)
  - **Wardrobe:** {{wardrobe}} (A JSON object of available clothing items. You can only use items from this list, but you can be creative in how you describe them.)

  **Your Task:**
  1.  **Analyze the Inputs:** Deeply consider the interplay between mood, event, and weather. A 'moody' vibe for a 'date' on a 'rainy' day requires a different approach than a 'happy' vibe for a 'casual hangout' on a 'sunny' day.
  2.  **Craft the Outfit:**
      *   **Outfit Name:** Give the outfit a creative, evocative name (e.g., "Autumn Afternoon Poet", "City Slicker Edge").
      *   **Mood Tag:** Use the provided mood tag.
      *   **Explanation:** Write a compelling, Pinterest-style explanation. Describe why this combination is perfect, touching upon the textures, colors, and overall silhouette. Explain how it fits the mood, event, and is practical for the weather.
      *   **Items:** Select EXACTLY 4 items: a Top, a Bottom, Footwear, and an Accessory from the provided wardrobe.
          *   For each item, create a **highly detailed, visually rich description**. This description will be used to generate an image, so be specific about the material, fit, color, and style. Think like a photographer setting up a product shot for a high-end fashion blog. For example, instead of "white t-shirt", describe it as "A crisp, white, slightly oversized cotton t-shirt, artfully tucked into the waistband."
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
