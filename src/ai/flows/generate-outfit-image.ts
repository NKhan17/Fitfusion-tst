'use server';
/**
 * @fileOverview Generates an image for a clothing item based on a description.
 *
 * - generateOutfitImage - A function that takes a description and returns a generated image URL.
 * - GenerateOutfitImageInput - The input type for the generateOutfitImage function.
 * - GenerateOutfitImageOutput - The return type for the generateOutfitImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOutfitImageInputSchema = z.string().describe('A detailed description of a clothing item.');
export type GenerateOutfitImageInput = z.infer<typeof GenerateOutfitImageInputSchema>;

const GenerateOutfitImageOutputSchema = z.object({
  imageUrl: z.string().describe("The data URI of the generated image. Format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateOutfitImageOutput = z.infer<typeof GenerateOutfitImageOutputSchema>;

export async function generateOutfitImage(
  input: GenerateOutfitImageInput
): Promise<GenerateOutfitImageOutput> {
  return generateOutfitImageFlow(input);
}

const generateOutfitImageFlow = ai.defineFlow(
  {
    name: 'generateOutfitImageFlow',
    inputSchema: GenerateOutfitImageInputSchema,
    outputSchema: GenerateOutfitImageOutputSchema,
  },
  async (description) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `A high-resolution, professional-quality photo of a single clothing item on a neutral, minimalist background. The item is: ${description}. The style should be clean, modern, and aesthetically pleasing, like a product shot for a high-end online fashion store or a popular Pinterest pin. Do not include any people or mannequins.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
        throw new Error('Image generation failed.');
    }

    return { imageUrl: media.url };
  }
);
