'use server';
/**
 * @fileOverview A car recommendation prompt generator.
 *
 * - generateCarRecommendationPrompt - A function that generates a car recommendation prompt.
 * - GenerateCarRecommendationPromptInput - The input type for the generateCarRecommendationPrompt function.
 * - GenerateCarRecommendationPromptOutput - The return type for the generateCarRecommendationPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCarRecommendationPromptInputSchema = z.object({
  preferences: z
    .string()
    .describe('The user preferences for the car recommendation.'),
});
export type GenerateCarRecommendationPromptInput = z.infer<
  typeof GenerateCarRecommendationPromptInputSchema
>;

const GenerateCarRecommendationPromptOutputSchema = z.object({
  prompt: z.string().describe('The generated car recommendation prompt.'),
});
export type GenerateCarRecommendationPromptOutput = z.infer<
  typeof GenerateCarRecommendationPromptOutputSchema
>;

export async function generateCarRecommendationPrompt(
  input: GenerateCarRecommendationPromptInput
): Promise<GenerateCarRecommendationPromptOutput> {
  return generateCarRecommendationPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCarRecommendationPromptPrompt',
  input: {schema: GenerateCarRecommendationPromptInputSchema},
  output: {schema: GenerateCarRecommendationPromptOutputSchema},
  prompt: `Based on the user's preferences: {{{preferences}}}, generate a prompt to start a conversation about car recommendations.`,
});

const generateCarRecommendationPromptFlow = ai.defineFlow(
  {
    name: 'generateCarRecommendationPromptFlow',
    inputSchema: GenerateCarRecommendationPromptInputSchema,
    outputSchema: GenerateCarRecommendationPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
