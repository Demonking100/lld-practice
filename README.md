# LLD Practice Platform MVP

A Low-Level Design (LLD) practice and feedback platform where learners can practice designing software systems (e.g. Parking Lot, Elevator System) and receive instant structured evaluation feedback.

---

## Quick Start

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm

### 2. Install & Run

From the root directory:

```bash
# 1. Install all dependencies (backend + frontend)
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# 2. Run Backend (port 3001)
npm run dev:backend

# 3. In a separate terminal, run Frontend (port 5173)
npm run dev:frontend
```

Open `http://localhost:5173` in your browser.

### 3. Run Backend Tests

```bash
npm test
```

---

## Core User Flow

1. **Choose Problem**: Select between pre-seeded LLD problems ("Design a Parking Lot", "Design an Elevator System").
2. **Write Design**: Draft class structures, entity relationships, and architectural details in plain text or markdown format.
3. **Submit**: Click "Submit Design" to trigger automated evaluation.
4. **See Feedback**: View visual completeness & structure scores, matched domain entities, missing domain entities, and evaluator recommendations.
5. **View History**: Inspect past attempts with status badges (`in_progress`, `evaluated`, `failed`).
6. **Retry & Iterate**: Re-evaluate failed submissions or start new attempts to improve scores.

---

## System Architecture Overview

```
lld-practice-platform/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.js          # File-backed JSON store & startup problem seeder
│   │   │   └── data.json            # Persistent JSON database storage
│   │   ├── evaluators/
│   │   │   ├── Evaluator.js         # Abstract Base Interface for Evaluators
│   │   │   ├── RuleBasedEvaluator.js# Concrete rule-based evaluator
│   │   │   └── LLMEvaluator.js      # Stubbed LLM evaluator (Open-Closed extension point)
│   │   ├── routes/
│   │   │   ├── problems.js          # GET /problems, GET /problems/:id, POST /problems/:id/attempts
│   │   │   └── attempts.js          # GET /attempts, GET /attempts/:id, POST /attempts/:id/submit, POST /attempts/:id/retry
│   │   ├── app.js                   # Express application setup
│   │   └── server.js                # Server listener entry point
│   └── tests/
│       ├── evaluator.test.js        # Unit tests for RuleBasedEvaluator
│       └── api.test.js              # Integration tests for REST API & edge cases
├── frontend/
│   ├── src/
│   │   ├── api.js                   # REST API client wrapper
│   │   ├── components/
│   │   │   ├── Header.jsx           # App navigation header
│   │   │   ├── ProblemList.jsx      # Seeded problems directory
│   │   │   ├── ProblemWorkspace.jsx # Markdown editor & submission workspace
│   │   │   ├── FeedbackReport.jsx   # Structured feedback report component
│   │   │   ├── AttemptHistory.jsx   # Past attempts list with empty state
│   │   │   └── AttemptDetail.jsx    # Attempt detail view & retry action
│   │   ├── App.jsx                  # State management & routing
│   │   └── index.css                # Plain minimal CSS stylesheet
└── README.md
```

---

## Key Design Decisions

1. **Evaluator Interface Abstraction**:
   - `Evaluator` is structured as a base class interface.
   - `RuleBasedEvaluator` implements deterministic heuristic checks (entity matching, detail length, OOP structural keywords).
   - `LLMEvaluator` is provided as a stub to show how an external LLM API (e.g. OpenAI GPT-4, Gemini) can be plugged in without changing `Attempt`, `Submission`, or `Problem` data models.

2. **Edge Case & Failure Handling**:
   - **Empty / Whitespace-only submission**: Returns a 400 validation error and does not create an evaluated attempt record.
   - **Exceeding 5000 characters**: Returns a 400 validation error with character count details.
   - **Evaluation Exceptions**: Wrapped in a try/catch block. If an evaluation throws an error, attempt status becomes `"failed"`.
   - **Retry Endpoint (`POST /attempts/:id/retry`)**: Allows synchronous retry of failed evaluations without rebuilding the submission text.
   - **Zero Attempts State**: Renders a friendly empty state encouraging the learner to select a problem.

3. **Zero Native Dependencies Database**:
   - Built with a lightweight, file-backed JSON database store (`backend/src/db/database.js`).
   - Ensures cross-platform compatibility across Windows, macOS, and Linux without native C++ compilation overhead.

---

## Known Limitations & Future Enhancements

- **Single Hardcoded Learner**: Authentication is omitted per requirements. All attempts are scoped to `default_learner`.
- **Rule-Based Heuristics**: The current evaluator relies on regex and keyword heuristics. Integration with `LLMEvaluator` will provide deep qualitative feedback on design patterns and SOLID principles.
