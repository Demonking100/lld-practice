import React from 'react';

export default function FeedbackReport({ feedback }) {
  if (!feedback) return null;

  const { completenessScore, structureScore, matchedEntities = [], missingEntities = [], comments = [] } = feedback;

  return (
    <div className="feedback-report">
      <h3>Evaluation Feedback Report</h3>

      <div className="scores-grid">
        <div className="score-card">
          <span className="score-label">Completeness Score</span>
          <span className={`score-value ${completenessScore >= 70 ? 'high' : completenessScore >= 40 ? 'med' : 'low'}`}>
            {completenessScore} / 100
          </span>
        </div>

        <div className="score-card">
          <span className="score-label">Structure Score</span>
          <span className={`score-value ${structureScore >= 70 ? 'high' : structureScore >= 40 ? 'med' : 'low'}`}>
            {structureScore} / 100
          </span>
        </div>
      </div>

      <div className="entities-section">
        <div className="entity-group">
          <strong>Matched Core Entities:</strong>
          <div className="chip-container">
            {matchedEntities.length > 0 ? (
              matchedEntities.map((entity, i) => (
                <span key={i} className="chip matched">{entity}</span>
              ))
            ) : (
              <span className="none-text">None matched</span>
            )}
          </div>
        </div>

        <div className="entity-group">
          <strong>Missing Core Entities:</strong>
          <div className="chip-container">
            {missingEntities.length > 0 ? (
              missingEntities.map((entity, i) => (
                <span key={i} className="chip missing">{entity}</span>
              ))
            ) : (
              <span className="all-text">All key entities identified!</span>
            )}
          </div>
        </div>
      </div>

      <div className="comments-section">
        <strong>Evaluator Comments & Recommendations:</strong>
        <ul>
          {comments.map((comment, i) => (
            <li key={i}>{comment}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
