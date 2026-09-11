const Evaluator = require('./Evaluator');

/**
 * LLMEvaluator - Groq-powered AI Evaluation
 * 
 * Uses Groq's fast inference API with Llama models to provide
 * qualitative AI-powered feedback on low-level design submissions.
 */
class LLMEvaluator extends Evaluator {
  constructor() {
    super();
    this.apiKey = process.env.GROQ_API_KEY;
    this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    this.model = 'llama3-8b-8192';
  }

  async evaluate(submissionText, problem, options = {}) {
    if (!submissionText || typeof submissionText !== 'string') {
      throw new Error('Invalid submission text provided for LLM evaluation.');
    }

    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is not set. Add it to backend/.env file.');
    }

    const submissionType = options.submissionType || 'text';

    const prompt = `You are an expert Software Architect reviewing a Low-Level Design submission.

Problem: "${problem.title}"
Description: ${problem.description}
Expected Entities: ${(problem.expectedEntities || []).join(', ')}
Submission Type: ${submissionType}

Learner's Submission:
---
${submissionText}
---

Evaluate this submission and respond with ONLY valid JSON (no markdown, no backticks, no explanation outside JSON):
{
  "completenessScore": <number 0-100, how thoroughly the design covers the problem requirements>,
  "structureScore": <number 0-100, how well-structured the OOP design is>,
  "pseudocodeScore": <number 0-100, quality of algorithms/pseudocode logic>,
  "matchedEntities": [<list of expected entities that were addressed>],
  "missingEntities": [<list of expected entities that were NOT addressed>],
  "pseudocodeMetrics": {
    "functionsFound": <number of functions/methods defined>,
    "controlFlowsFound": <number of control flow statements>,
    "dataStructuresFound": <number of data structures used>,
    "returnsFound": <number of return statements>
  },
  "comments": [<3-5 specific, actionable feedback comments as strings>]
}`;

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert software design evaluator. Always respond with valid JSON only. No markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Groq API Error (${response.status}): ${errorBody || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Groq API returned empty response.');
    }

    // Parse the JSON response, handling possible markdown wrapping
    let cleaned = content.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    let feedback;
    try {
      feedback = JSON.parse(cleaned);
    } catch (parseErr) {
      throw new Error(`Failed to parse AI response as JSON: ${parseErr.message}`);
    }

    // Validate and clamp scores
    return {
      completenessScore: Math.min(100, Math.max(0, Math.round(feedback.completenessScore || 0))),
      structureScore: Math.min(100, Math.max(0, Math.round(feedback.structureScore || 0))),
      pseudocodeScore: Math.min(100, Math.max(0, Math.round(feedback.pseudocodeScore || 0))),
      matchedEntities: Array.isArray(feedback.matchedEntities) ? feedback.matchedEntities : [],
      missingEntities: Array.isArray(feedback.missingEntities) ? feedback.missingEntities : [],
      pseudocodeMetrics: {
        functionsFound: feedback.pseudocodeMetrics?.functionsFound || 0,
        controlFlowsFound: feedback.pseudocodeMetrics?.controlFlowsFound || 0,
        dataStructuresFound: feedback.pseudocodeMetrics?.dataStructuresFound || 0,
        returnsFound: feedback.pseudocodeMetrics?.returnsFound || 0
      },
      comments: Array.isArray(feedback.comments) ? feedback.comments : ['AI evaluation completed.'],
      evaluatedBy: 'ai'
    };
  }
}

module.exports = LLMEvaluator;
