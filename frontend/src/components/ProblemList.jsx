import React from 'react';

export default function ProblemList({ problems, onStartAttempt, loading, error }) {
  if (loading) return <div className="loading">Loading problems...</div>;
  if (error) return <div className="error-banner">{error}</div>;

  return (
    <div className="problem-list-container">
      <h2>Available Low-Level Design Problems</h2>
      <p className="description">Select a problem to practice your class design, entity relationships, and structural design skills.</p>

      <div className="problems-grid">
        {problems.map(problem => (
          <div key={problem.id} className="problem-card">
            <h3>{problem.title}</h3>
            <p className="problem-desc">{problem.description}</p>
            <div className="expected-entities">
              <small>Key Entities: {problem.expectedEntities?.join(', ')}</small>
            </div>
            <button
              className="primary-btn"
              onClick={() => onStartAttempt(problem.id)}
            >
              Start Attempt
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
