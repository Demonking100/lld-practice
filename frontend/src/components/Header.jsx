import React from 'react';

export default function Header({ activeView, setActiveView }) {
  return (
    <header className="app-header">
      <div className="logo-container">
        <h1>LLD Practice Platform</h1>
        <span className="subtitle">Low-Level Design Evaluator & Practice</span>
      </div>
      <nav className="nav-tabs">
        <button
          className={`nav-btn ${activeView === 'problems' || activeView === 'workspace' ? 'active' : ''}`}
          onClick={() => setActiveView('problems')}
        >
          Problems
        </button>
        <button
          className={`nav-btn ${activeView === 'history' || activeView === 'attempt_detail' ? 'active' : ''}`}
          onClick={() => setActiveView('history')}
        >
          History
        </button>
      </nav>
      <div className="user-badge">
        Default Learner (No Auth)
      </div>
    </header>
  );
}
