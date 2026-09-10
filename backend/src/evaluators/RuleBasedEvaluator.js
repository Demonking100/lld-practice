const Evaluator = require('./Evaluator');

/**
 * RuleBasedEvaluator
 * 
 * Performs deterministic heuristic checks on low-level design submissions:
 * 1. Entity Matching: Checks presence of expected domain entities/keywords.
 * 2. Detail/Length Check: Evaluates completeness based on word count & detail depth.
 * 3. Structure Check: Evaluates object-oriented keywords (class, interface, abstract, extends, implements, pattern names).
 */
class RuleBasedEvaluator extends Evaluator {
  evaluate(submissionText, problem) {
    if (!submissionText || typeof submissionText !== 'string') {
      throw new Error('Invalid submission text provided for evaluation.');
    }

    const textLower = submissionText.toLowerCase();
    const words = submissionText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // 1. Matched vs Missing Entities Check
    const expected = problem.expectedEntities || [];
    const matchedEntities = [];
    const missingEntities = [];

    expected.forEach(entity => {
      // Case-insensitive match, checking plural forms / variations if applicable
      const entityRegex = new RegExp(`\\b${entity.toLowerCase()}(s)?\\b`, 'i');
      if (entityRegex.test(submissionText)) {
        matchedEntities.push(entity);
      } else {
        missingEntities.push(entity);
      }
    });

    // Entity coverage ratio (0 to 100)
    const entityCoverageRatio = expected.length > 0
      ? (matchedEntities.length / expected.length)
      : 1;

    // 2. Completeness Score Calculation (Length + Entity Coverage)
    let lengthScore = 0;
    if (wordCount >= 200) lengthScore = 100;
    else if (wordCount >= 100) lengthScore = 80;
    else if (wordCount >= 50) lengthScore = 60;
    else if (wordCount >= 20) lengthScore = 40;
    else lengthScore = 20;

    const completenessScore = Math.min(
      100,
      Math.round(lengthScore * 0.5 + entityCoverageRatio * 100 * 0.5)
    );

    // 3. Structure Score Calculation (Object Oriented Keywords)
    const oopKeywords = ['class', 'interface', 'abstract', 'extends', 'implements', 'enum', 'pattern', 'singleton', 'factory', 'strategy', 'observer'];
    const matchedOOPKeywords = oopKeywords.filter(kw => textLower.includes(kw));

    let structureScore = 30; // base score for formatting
    structureScore += matchedOOPKeywords.length * 12;

    // Bonus if code blocks or markdown headers are present
    if (/#+\s/.test(submissionText) || /```/.test(submissionText)) {
      structureScore += 15;
    }
    structureScore = Math.min(100, Math.max(0, Math.round(structureScore)));

    // 4. Generate Human-Readable Comments
    const comments = [];

    if (matchedEntities.length > 0) {
      comments.push(`Identified core domain entities: ${matchedEntities.join(', ')}.`);
    }

    if (missingEntities.length > 0) {
      comments.push(`Consider defining or elaborating on missing key entities: ${missingEntities.join(', ')}.`);
    } else {
      comments.push('Excellent! All target domain entities were identified in your design.');
    }

    if (matchedOOPKeywords.length > 0) {
      comments.push(`Good structure-mindedness! Utilized key structural concepts: ${matchedOOPKeywords.join(', ')}.`);
    } else {
      comments.push('Tip: Explicitly define relationships using keywords like "class", "interface", "extends", or "implements".');
    }

    if (wordCount < 50) {
      comments.push('Your submission is quite brief. Expanding on class responsibilities and method signatures will improve your score.');
    } else if (wordCount >= 150) {
      comments.push('Detailed design provided with thorough explanations.');
    }

    return {
      completenessScore,
      structureScore,
      matchedEntities,
      missingEntities,
      comments
    };
  }
}

module.exports = RuleBasedEvaluator;
