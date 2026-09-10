const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { crypto } = require('crypto');

// GET /problems - List all seeded problems
router.get('/', (req, res) => {
  const problems = db.getProblems();
  res.json(problems);
});

// GET /problems/:id - Get problem detail
router.get('/:id', (req, res) => {
  const problem = db.getProblemById(req.params.id);
  if (!problem) {
    return res.status(404).json({ error: `Problem with ID '${req.params.id}' not found.` });
  }
  res.json(problem);
});

// POST /problems/:id/attempts - Start a new attempt on a problem
router.post('/:id/attempts', (req, res) => {
  const problem = db.getProblemById(req.params.id);
  if (!problem) {
    return res.status(404).json({ error: `Cannot start attempt. Problem with ID '${req.params.id}' not found.` });
  }

  const attemptId = 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newAttempt = {
    id: attemptId,
    problemId: problem.id,
    problemTitle: problem.title,
    learnerId: 'default_learner',
    status: 'in_progress',
    submissionText: '',
    feedback: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.createAttempt(newAttempt);
  res.status(201).json(newAttempt);
});

module.exports = router;
