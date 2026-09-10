import React from 'react';

export default function AttemptHistory({ attempts, onSelectAttempt, onStartNewProblem, loading, error }) {
  if (loading) return <div className="loading">Loading history...</div>;
  if (error) return <div className="error-banner">{error}</div>;

  if (!attempts || attempts.length === 0) {
    return (
      <div className="empty-history-state">
        <h3>No Attempts Yet</h3>
        <p>You haven't submitted any Low-Level Design solutions yet.</p>
        <button className="primary-btn" onClick={onStartNewProblem}>
          Browse Problems & Start Practicing
        </button>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h2>Past Attempts History</h2>

      <div className="attempts-table-wrapper">
        <table className="attempts-table">
          <thead>
            <tr>
              <th>Problem Title</th>
              <th>Submitted Date</th>
              <th>Status</th>
              <th>Completeness</th>
              <th>Structure</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map(att => (
              <tr key={att.id} className="attempt-row" onClick={() => onSelectAttempt(att.id)}>
                <td>
                  <strong>{att.problemTitle || att.problemId}</strong>
                </td>
                <td>
                  {new Date(att.createdAt).toLocaleString()}
                </td>
                <td>
                  <span className={`status-pill ${att.status}`}>
                    {att.status}
                  </span>
                </td>
                <td>
                  {att.feedback ? `${att.feedback.completenessScore}/100` : '-'}
                </td>
                <td>
                  {att.feedback ? `${att.feedback.structureScore}/100` : '-'}
                </td>
                <td>
                  <button className="view-btn">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
