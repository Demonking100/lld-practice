import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProblemList from './components/ProblemList';
import ProblemWorkspace from './components/ProblemWorkspace';
import AttemptHistory from './components/AttemptHistory';
import AttemptDetail from './components/AttemptDetail';
import { fetchProblems, fetchAttempts, startAttempt, fetchProblemById } from './api';

export default function App() {
  const [activeView, setActiveView] = useState('problems'); // 'problems' | 'workspace' | 'history' | 'attempt_detail'
  const [problems, setProblems] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);

  const [loadingProblems, setLoadingProblems] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);

  const loadProblemsList = async () => {
    setLoadingProblems(true);
    setError(null);
    try {
      const data = await fetchProblems();
      setProblems(data);
    } catch (err) {
      setError('Failed to load problems from backend server.');
    } finally {
      setLoadingProblems(false);
    }
  };

  const loadHistoryList = async () => {
    setLoadingHistory(true);
    setError(null);
    try {
      const data = await fetchAttempts();
      setAttempts(data);
    } catch (err) {
      setError('Failed to load attempt history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadProblemsList();
  }, []);

  useEffect(() => {
    if (activeView === 'history') {
      loadHistoryList();
    }
  }, [activeView]);

  const handleStartAttempt = async (problemId) => {
    setError(null);
    try {
      const newAttempt = await startAttempt(problemId);
      const problem = await fetchProblemById(problemId);
      setCurrentAttempt({
        ...newAttempt,
        problem
      });
      setActiveView('workspace');
    } catch (err) {
      setError(err.message || 'Failed to start attempt');
    }
  };

  const handleSelectAttempt = (attemptId) => {
    setSelectedAttemptId(attemptId);
    setActiveView('attempt_detail');
  };

  return (
    <div className="app-container">
      <Header activeView={activeView} setActiveView={setActiveView} />

      <main className="main-content">
        {activeView === 'problems' && (
          <ProblemList
            problems={problems}
            onStartAttempt={handleStartAttempt}
            loading={loadingProblems}
            error={error}
          />
        )}

        {activeView === 'workspace' && (
          <ProblemWorkspace
            attempt={currentAttempt}
            setAttempt={setCurrentAttempt}
            onBackToProblems={() => setActiveView('problems')}
          />
        )}

        {activeView === 'history' && (
          <AttemptHistory
            attempts={attempts}
            onSelectAttempt={handleSelectAttempt}
            onStartNewProblem={() => setActiveView('problems')}
            loading={loadingHistory}
            error={error}
          />
        )}

        {activeView === 'attempt_detail' && (
          <AttemptDetail
            attemptId={selectedAttemptId}
            onBackToHistory={() => setActiveView('history')}
            onStartNewAttempt={(problemId) => handleStartAttempt(problemId)}
          />
        )}
      </main>
    </div>
  );
}
