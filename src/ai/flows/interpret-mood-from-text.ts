'use server';

/**
 * @fileOverview This file contains a Genkit flow that interprets a user's vibe from a text description.
 *
 * - interpretVibeFromText - A function that accepts a text description and returns a vibe category.
 * - InterpretVibeFromTextInput - The input type for the interpretVibeFromText function.
 * - InterpretVibeFromTextOutput - The return type for the interpretVibeFromText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretVibeFromTextInputSchema = z.object({
  text: z.string().describe('A text description of the user\'s vibe.'),
});
export type InterpretVibeFromTextInput = z.infer<typeof InterpretVibeFromTextInputSchema>;

const InterpretVibeFromTextOutputSchema = z.object({
  vibeCategory: z
    .string()
    .describe(
      'The interpreted vibe category (e.g., happy, moody, chaotic, calm, dreamy, confident).'      
    ),
});
export type InterpretVibeFromTextOutput = z.infer<typeof InterpretVibeFromTextOutputSchema>;

export async function interpretVibeFromText(
  input: InterpretVibeFromTextInput
): Promise<InterpretVibeFromTextOutput> {
  return interpretVibeFromTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interpretVibeFromTextPrompt',
  input: {schema: InterpretVibeFromTextInputSchema},
  output: {schema: InterpretVibeFromTextOutputSchema},
  prompt: `You are a vibe interpreter.  The user will describe their vibe, and you will categorize it into one of the following categories: happy, moody, chaotic, calm, dreamy, confident.

User description: {{{text}}}

Respond ONLY with the vibe category.  Do not include any other text.  The vibe category must be one of: happy, moody, chaotic, calm, dreamy, confident.`,
});

const interpretVibeFromTextFlow = ai.defineFlow(
  {
    name: 'interpretVibeFromTextFlow',
    inputSchema: InterpretVibeFromTextInputSchema,
    outputSchema: InterpretVibeFromTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
