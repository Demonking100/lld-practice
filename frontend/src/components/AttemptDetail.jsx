import React, { useState, useEffect } from 'react';
import FeedbackReport from './FeedbackReport';
import { fetchAttemptById, retryAttempt } from '../api';

export default function AttemptDetail({ attemptId, onBackToHistory, onStartNewAttempt }) {
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const loadAttempt = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchAttemptById(attemptId);
      setAttempt(data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load attempt details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (attemptId) {
      loadAttempt();
    }
  }, [attemptId]);

  const handleRetry = async () => {
    setRetrying(true);
    setErrorMsg(null);
    try {
      const updated = await retryAttempt(attemptId);
      setAttempt(prev => ({
        ...prev,
        ...updated
      }));
    } catch (err) {
      setErrorMsg(err.message || 'Retry evaluation failed');
      if (err.attempt) {
        setAttempt(prev => ({
          ...prev,
          ...err.attempt
        }));
      }
    } finally {
      setRetrying(false);
    }
  };

  if (loading) return <div className="loading">Loading attempt details...</div>;
  if (errorMsg && !attempt) return <div className="error-banner">{errorMsg}</div>;
  if (!attempt) return <div className="error-banner">Attempt not found.</div>;

  return (
    <div className="attempt-detail-container">
      <div className="detail-nav">
        <button className="secondary-btn" onClick={onBackToHistory}>
          &larr; Back to History
        </button>

        <button
          className="primary-btn"
          onClick={() => onStartNewAttempt(attempt.problemId)}
        >
          Try Again (New Attempt)
        </button>
      </div>

      <div className="detail-card">
        <div className="detail-header">
          <h2>{attempt.problemTitle || attempt.problem?.title || 'Attempt Detail'}</h2>
          <div className="detail-meta">
            <span>Submitted: {new Date(attempt.createdAt).toLocaleString()}</span>
            <span className={`status-pill ${attempt.status}`}>
              Status: {attempt.status}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="error-banner">
            {errorMsg}
          </div>
        )}

        {attempt.status === 'failed' && (
          <div className="failed-retry-box">
            <p><strong>Evaluation Failed:</strong> An issue occurred while evaluating this submission.</p>
            <button className="primary-btn retry-btn" onClick={handleRetry} disabled={retrying}>
              {retrying ? 'Retrying Evaluation...' : 'Retry Evaluation'}
            </button>
          </div>
        )}

        <div className="submission-section">
          <h4>Submitted Design Text</h4>
          <pre className="text-display">
            {attempt.submissionText || '(No submission text provided)'}
          </pre>
        </div>

        {attempt.feedback && (
          <FeedbackReport feedback={attempt.feedback} />
        )}
      </div>
    </div>
  );
}
