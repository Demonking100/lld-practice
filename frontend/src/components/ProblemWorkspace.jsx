import React, { useState } from 'react';
import FeedbackReport from './FeedbackReport';
import { submitAttempt, retryAttempt } from '../api';

export default function ProblemWorkspace({ attempt, setAttempt, onBackToProblems }) {
  const [submissionText, setSubmissionText] = useState(attempt?.submissionText || '');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!attempt) return <div className="error-banner">No active attempt found.</div>;

  const charCount = submissionText.length;
  const isOverLimit = charCount > 5000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Client-side quick check
    if (!submissionText || submissionText.trim().length === 0) {
      setErrorMsg('Validation Error: Submission text cannot be empty or whitespace-only.');
      return;
    }

    if (isOverLimit) {
      setErrorMsg(`Validation Error: Submission exceeds maximum limit of 5000 characters (${charCount} chars).`);
      return;
    }

    setSubmitting(true);

    try {
      const updated = await submitAttempt(attempt.id, submissionText, simulateFailure);
      setAttempt(updated);
    } catch (err) {
      setErrorMsg(err.message || 'Submission failed');
      if (err.attempt) {
        setAttempt(err.attempt);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const updated = await retryAttempt(attempt.id);
      setAttempt(updated);
    } catch (err) {
      setErrorMsg(err.message || 'Retry failed');
      if (err.attempt) {
        setAttempt(err.attempt);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="workspace-container">
      <div className="workspace-header">
        <button className="secondary-btn" onClick={onBackToProblems}>
          &larr; Back to Problems
        </button>
        <span className={`status-pill ${attempt.status}`}>
          Status: {attempt.status}
        </span>
      </div>

      <div className="problem-prompt-box">
        <h2>{attempt.problemTitle || attempt.problem?.title || 'Problem Design'}</h2>
        <p>{attempt.problem?.description}</p>
        {attempt.problem?.expectedEntities && (
          <small className="hint">
            Expected Core Entities: {attempt.problem.expectedEntities.join(', ')}
          </small>
        )}
      </div>

      {errorMsg && (
        <div className="error-banner">
          <strong>Error: </strong> {errorMsg}
          {attempt.status === 'failed' && (
            <button className="retry-inline-btn" onClick={handleRetry} disabled={submitting}>
              {submitting ? 'Retrying...' : 'Retry Evaluation'}
            </button>
          )}
        </div>
      )}

      {attempt.status !== 'evaluated' ? (
        <form onSubmit={handleSubmit} className="submission-form">
          <label htmlFor="design-input">
            <strong>Your Low-Level Design (Text / Markdown format):</strong>
          </label>
          <textarea
            id="design-input"
            rows={12}
            placeholder="Write your class design, interface definitions, entity relationships, and key algorithms here..."
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            disabled={submitting}
          />

          <div className="form-footer">
            <span className={`char-count ${isOverLimit ? 'exceeded' : ''}`}>
              {charCount} / 5000 characters
            </span>

            <div className="form-actions">
              <label className="checkbox-label" title="Check this to simulate a 500 evaluation exception to test failure handling & retry">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                />
                Simulate Evaluation Failure (Edge Case)
              </label>

              <button
                type="submit"
                className="primary-btn"
                disabled={submitting || isOverLimit}
              >
                {submitting ? 'Evaluating...' : 'Submit Design'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="submitted-view">
          <div className="submission-preview">
            <h4>Submitted Design:</h4>
            <pre className="text-display">{attempt.submissionText}</pre>
          </div>

          <FeedbackReport feedback={attempt.feedback} />
        </div>
      )}
    </div>
  );
}
