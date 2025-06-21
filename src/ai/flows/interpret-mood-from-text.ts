// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview This file contains a Genkit flow that interprets a user's mood from a text description.
 *
 * - interpretMoodFromText - A function that accepts a text description and returns a mood category.
 * - InterpretMoodFromTextInput - The input type for the interpretMoodFromText function.
 * - InterpretMoodFromTextOutput - The return type for the interpretMoodFromText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretMoodFromTextInputSchema = z.object({
  text: z.string().describe('A text description of the user\'s mood.'),
});
export type InterpretMoodFromTextInput = z.infer<typeof InterpretMoodFromTextInputSchema>;

const InterpretMoodFromTextOutputSchema = z.object({
  moodCategory: z
    .string()
    .describe(
      'The interpreted mood category (e.g., happy, moody, chaotic, calm, dreamy, confident).'      
    ),
});
export type InterpretMoodFromTextOutput = z.infer<typeof InterpretMoodFromTextOutputSchema>;

export async function interpretMoodFromText(
  input: InterpretMoodFromTextInput
): Promise<InterpretMoodFromTextOutput> {
  return interpretMoodFromTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interpretMoodFromTextPrompt',
  input: {schema: InterpretMoodFromTextInputSchema},
  output: {schema: InterpretMoodFromTextOutputSchema},
  prompt: `You are a mood interpreter.  The user will describe their mood, and you will categorize it into one of the following categories: happy, moody, chaotic, calm, dreamy, confident.

User description: {{{text}}}

Respond ONLY with the mood category.  Do not include any other text.  The mood category must be one of: happy, moody, chaotic, calm, dreamy, confident.`,
});

const interpretMoodFromTextFlow = ai.defineFlow(
  {
    name: 'interpretMoodFromTextFlow',
    inputSchema: InterpretMoodFromTextInputSchema,
    outputSchema: InterpretMoodFromTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
