/**
 * Interface / Base Class for Evaluators
 * 
 * Any concrete evaluator implementation must implement the `evaluate` method
 * and return a FeedbackResult object adhering to the contract:
 * {
 *   completenessScore: number (0-100),
 *   structureScore: number (0-100),
 *   matchedEntities: string[],
 *   missingEntities: string[],
 *   comments: string[]
 * }
 */
class Evaluator {
  /**
   * Evaluates a submission text against a given problem description.
   * @param {string} submissionText - Plain text / markdown design submitted by learner.
   * @param {object} problem - Problem entity containing title, description, expectedEntities, etc.
   * @returns {object} FeedbackResult object
   */
  evaluate(submissionText, problem) {
    throw new Error("Method 'evaluate()' must be implemented by concrete Evaluator subclasses.");
  }
}

module.exports = Evaluator;
