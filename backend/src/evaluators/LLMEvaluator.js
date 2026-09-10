const Evaluator = require('./Evaluator');

/**
 * LLMEvaluator (Stub Implementation)
 * 
 * Demonstrates open-closed principle: a secondary evaluator can be swapped in
 * or chained without modifying the Problem, Attempt, or Submission models.
 * 
 * Example integration using OpenAI / Gemini / Claude API for qualitative feedback:
 */
class LLMEvaluator extends Evaluator {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey || process.env.LLM_API_KEY;
  }

  async evaluate(submissionText, problem) {
    if (!submissionText || typeof submissionText !== 'string') {
      throw new Error('Invalid submission text provided for LLM evaluation.');
    }

    /*
     * STUB: Where external LLM API would be invoked:
     * 
     * const prompt = `
     * You are an expert Software Architect reviewing a Low-Level Design submission for problem: "${problem.title}".
     * Requirements: ${problem.description}
     * Expected entities: ${problem.expectedEntities.join(', ')}
     * 
     * Learner Submission:
     * ${submissionText}
     * 
     * Respond with JSON:
     * {
     *   "completenessScore": number (0-100),
     *   "structureScore": number (0-100),
     *   "matchedEntities": string[],
     *   "missingEntities": string[],
     *   "comments": string[]
     * }
     * `;
     * 
     * const response = await llmClient.generateContent(prompt);
     * return JSON.parse(response.text);
     */

    throw new Error('LLMEvaluator is a stub for future integration. Use RuleBasedEvaluator for current MVP evaluation.');
  }
}

module.exports = LLMEvaluator;
