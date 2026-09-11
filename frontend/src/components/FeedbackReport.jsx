import React from 'react';

export default function FeedbackReport({ feedback }) {
  if (!feedback) return null;

  const {
    completenessScore,
    structureScore,
    pseudocodeScore,
    pseudocodeMetrics,
    matchedEntities = [],
    missingEntities = [],
    comments = []
  } = feedback;

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

        {typeof pseudocodeScore === 'number' && (
          <div className="score-card highlight">
            <span className="score-label">Pseudocode & Logic</span>
            <span className={`score-value ${pseudocodeScore >= 70 ? 'high' : pseudocodeScore >= 40 ? 'med' : 'low'}`}>
              {pseudocodeScore} / 100
            </span>
          </div>
        )}
      </div>

      {pseudocodeMetrics && (
        <div className="pseudocode-metrics-bar">
          <strong>Pseudocode Metrics:</strong>
          <div className="metrics-tags">
            <span className="metric-tag">
              Functions: <strong>{pseudocodeMetrics.functionsFound}</strong>
            </span>
            <span className="metric-tag">
              Control Flow Blocks: <strong>{pseudocodeMetrics.controlFlowsFound}</strong>
            </span>
            <span className="metric-tag">
              Data Structures: <strong>{pseudocodeMetrics.dataStructuresFound}</strong>
            </span>
            <span className="metric-tag">
              Return Statements: <strong>{pseudocodeMetrics.returnsFound}</strong>
            </span>
          </div>
        </div>
      )}

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
