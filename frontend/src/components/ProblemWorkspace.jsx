import React, { useState } from 'react';
import FeedbackReport from './FeedbackReport';
import { submitAttempt, retryAttempt } from '../api';

export default function ProblemWorkspace({ attempt, setAttempt, onBackToProblems }) {
  const [submissionMode, setSubmissionMode] = useState(attempt?.submissionType || 'text');
  const [textInput, setTextInput] = useState(attempt?.submissionText || '');
  const [pseudoCodeInput, setPseudoCodeInput] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!attempt) return <div className="error-banner">No active attempt found.</div>;

  const getCombinedText = () => {
    if (submissionMode === 'text') return textInput;
    if (submissionMode === 'pseudocode') return pseudoCodeInput;
    
    // Combined mode
    const textPart = textInput.trim() ? `### Architecture & Design Notes:\n${textInput.trim()}` : '';
    const codePart = pseudoCodeInput.trim() ? `### Pseudocode & Logic Implementation:\n\`\`\`pseudocode\n${pseudoCodeInput.trim()}\n\`\`\`` : '';
    return [textPart, codePart].filter(Boolean).join('\n\n');
  };

  const finalSubmissionText = getCombinedText();
  const charCount = finalSubmissionText.replace(/\s/g, '').length;
  const isOverLimit = charCount > 5000;

  const handleInsertTemplate = () => {
    const template = `CLASS ${attempt.problem?.expectedEntities?.[0] || 'MainComponent'} {
  PRIVATE state: String
  
  CONSTRUCTOR(initialState) {
    THIS.state = initialState
  }

  FUNCTION processRequest(data) {
    IF data IS NULL THEN
      RETURN false
    END IF
    
    FOR EACH item IN data DO
      // Algorithm logic here
    END FOR
    
    RETURN true
  }
}`;
    setPseudoCodeInput(prev => (prev ? prev + '\n\n' + template : template));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Client-side quick check
    if (!finalSubmissionText || finalSubmissionText.trim().length === 0) {
      setErrorMsg('Validation Error: Submission text cannot be empty or whitespace-only.');
      return;
    }

    if (isOverLimit) {
      setErrorMsg(`Validation Error: Submission exceeds maximum limit of 5000 characters (${charCount} chars).`);
      return;
    }

    setSubmitting(true);

    try {
      const updated = await submitAttempt(attempt.id, finalSubmissionText, simulateFailure, submissionMode);
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
          <div className="mode-selector-bar">
            <span className="mode-label">Submission Format:</span>
            <div className="mode-tabs">
              <button
                type="button"
                className={`mode-tab ${submissionMode === 'text' ? 'active' : ''}`}
                onClick={() => setSubmissionMode('text')}
              >
                📝 Text Design
              </button>
              <button
                type="button"
                className={`mode-tab ${submissionMode === 'pseudocode' ? 'active' : ''}`}
                onClick={() => setSubmissionMode('pseudocode')}
              >
                💻 Pseudocode
              </button>
              <button
                type="button"
                className={`mode-tab ${submissionMode === 'combined' ? 'active' : ''}`}
                onClick={() => setSubmissionMode('combined')}
              >
                🔀 Combined (Text + Pseudocode)
              </button>
            </div>
          </div>

          {(submissionMode === 'text' || submissionMode === 'combined') && (
            <div className="input-group">
              <label htmlFor="design-input">
                <strong>Text & Architecture Explanation:</strong>
              </label>
              <textarea
                id="design-input"
                rows={submissionMode === 'combined' ? 6 : 10}
                placeholder="Write your class design, entity relationships, trade-offs, and high-level structure..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={submitting}
              />
            </div>
          )}

          {(submissionMode === 'pseudocode' || submissionMode === 'combined') && (
            <div className="input-group pseudocode-group">
              <div className="pseudocode-header-row">
                <label htmlFor="pseudocode-input">
                  <strong>Pseudocode / Logic Implementation:</strong>
                </label>
                <button
                  type="button"
                  className="template-btn"
                  onClick={handleInsertTemplate}
                  disabled={submitting}
                >
                  ⚡ Insert Pseudocode Template
                </button>
              </div>
              <textarea
                id="pseudocode-input"
                className="pseudocode-editor"
                rows={submissionMode === 'combined' ? 8 : 12}
                placeholder={`// Write your algorithm logic or pseudocode here:\nFUNCTION processRequest(vehicle):\n  IF vehicle.type == "TRUCK" THEN\n    RETURN allocateLargeSlot()\n  END IF\n  RETURN allocateStandardSlot()`}
                value={pseudoCodeInput}
                onChange={(e) => setPseudoCodeInput(e.target.value)}
                disabled={submitting}
              />
            </div>
          )}

          <div className="form-footer">
            <span className={`char-count ${isOverLimit ? 'exceeded' : ''}`}>
              {charCount} / 5000 characters (excluding spaces)
            </span>

            <div className="form-actions">
              <label className="checkbox-label" title="Check this to simulate a 500 evaluation exception to test failure handling & retry">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                />
                Simulate Evaluation Failure
              </label>

              <button
                type="submit"
                className="primary-btn"
                disabled={submitting || isOverLimit}
              >
                {submitting ? 'Evaluating...' : 'Submit for Evaluation'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="submitted-view">
          <div className="submission-preview">
            <div className="preview-header">
              <h4>Submitted Solution</h4>
              {attempt.submissionType && (
                <span className="mode-badge">{attempt.submissionType.toUpperCase()} MODE</span>
              )}
            </div>
            <pre className="text-display">{attempt.submissionText}</pre>
          </div>

          <FeedbackReport feedback={attempt.feedback} />
        </div>
      )}
    </div>
  );
}
