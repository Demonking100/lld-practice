const express = require('express');
const router = express.Router();
const db = require('../db/database');
const RuleBasedEvaluator = require('../evaluators/RuleBasedEvaluator');

const evaluator = new RuleBasedEvaluator();
const MAX_SUBMISSION_LENGTH = 5000;

// GET /attempts - List all attempts (history)
router.get('/', (req, res) => {
  const attempts = db.getAttempts();
  // Sort by createdAt descending
  const sorted = [...attempts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sorted);
});

// GET /attempts/:id - Single attempt detail
router.get('/:id', (req, res) => {
  const attempt = db.getAttemptById(req.params.id);
  if (!attempt) {
    return res.status(404).json({ error: `Attempt with ID '${req.params.id}' not found.` });
  }

  // Attach problem details for display convenience if needed
  const problem = db.getProblemById(attempt.problemId);
  res.json({
    ...attempt,
    problem
  });
});

// POST /attempts/:id/submit - Submit text and trigger evaluation
router.post('/:id/submit', (req, res) => {
  const attempt = db.getAttemptById(req.params.id);
  if (!attempt) {
    return res.status(404).json({ error: `Attempt with ID '${req.params.id}' not found.` });
  }

  const { submissionText, simulateFailure } = req.body || {};

  // Edge case: Empty or whitespace-only submission
  if (!submissionText || typeof submissionText !== 'string' || submissionText.trim().length === 0) {
    return res.status(400).json({
      error: 'Validation Error: Submission text cannot be empty or whitespace-only.'
    });
  }

  // Edge case: Extremely long submission (>5000 chars)
  if (submissionText.length > MAX_SUBMISSION_LENGTH) {
    return res.status(400).json({
      error: `Validation Error: Submission exceeds maximum limit of ${MAX_SUBMISSION_LENGTH} characters (Current length: ${submissionText.length}).`
    });
  }

  const problem = db.getProblemById(attempt.problemId);
  if (!problem) {
    return res.status(404).json({ error: `Associated problem '${attempt.problemId}' not found.` });
  }

  // Handle evaluation with failure handling
  try {
    // Check for simulated failure flag for edge case testing
    if (simulateFailure === true || submissionText.includes('[SIMULATE_FAILURE]')) {
      throw new Error('Simulated evaluator failure triggered for testing.');
    }

    const feedback = evaluator.evaluate(submissionText, problem);

    const updatedAttempt = db.updateAttempt(attempt.id, {
      status: 'evaluated',
      submissionText,
      feedback
    });

    return res.json(updatedAttempt);
  } catch (err) {
    console.error(`Evaluation failed for attempt ${attempt.id}:`, err.message);

    const failedAttempt = db.updateAttempt(attempt.id, {
      status: 'failed',
      submissionText,
      feedback: null
    });

    return res.status(500).json({
      error: `Evaluation Error: ${err.message || 'Evaluation process failed.'}`,
      attempt: failedAttempt
    });
  }
});

// POST /attempts/:id/retry - Retry evaluation on a failed attempt
router.post('/:id/retry', (req, res) => {
  const attempt = db.getAttemptById(req.params.id);
  if (!attempt) {
    return res.status(404).json({ error: `Attempt with ID '${req.params.id}' not found.` });
  }

  if (!attempt.submissionText || attempt.submissionText.trim().length === 0) {
    return res.status(400).json({
      error: 'Cannot retry attempt without a saved submission text.'
    });
  }

  const problem = db.getProblemById(attempt.problemId);
  if (!problem) {
    return res.status(404).json({ error: `Associated problem '${attempt.problemId}' not found.` });
  }

  try {
    // If the submission text still has [SIMULATE_FAILURE], strip it during clean retry or evaluate clean text
    const cleanText = attempt.submissionText.replace('[SIMULATE_FAILURE]', '').trim();
    
    // Evaluate clean text
    const feedback = evaluator.evaluate(cleanText || attempt.submissionText, problem);

    const updatedAttempt = db.updateAttempt(attempt.id, {
      status: 'evaluated',
      submissionText: cleanText || attempt.submissionText,
      feedback
    });

    return res.json(updatedAttempt);
  } catch (err) {
    console.error(`Retry evaluation failed for attempt ${attempt.id}:`, err.message);

    const failedAttempt = db.updateAttempt(attempt.id, {
      status: 'failed',
      feedback: null
    });

    return res.status(500).json({
      error: `Retry Evaluation Error: ${err.message}`,
      attempt: failedAttempt
    });
  }
});

module.exports = router;
