const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchProblems() {
  const res = await fetch(`${API_BASE}/problems`);
  if (!res.ok) throw new Error('Failed to fetch problems');
  return res.json();
}

export async function fetchProblemById(id) {
  const res = await fetch(`${API_BASE}/problems/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Problem '${id}' not found`);
  }
  return res.json();
}

export async function startAttempt(problemId) {
  const res = await fetch(`${API_BASE}/problems/${problemId}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to start attempt');
  }
  return res.json();
}

export async function submitAttempt(attemptId, submissionText, simulateFailure = false, submissionType = 'text') {
  const res = await fetch(`${API_BASE}/attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ submissionText, simulateFailure, submissionType })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Submission failed');
    error.attempt = data.attempt;
    error.status = res.status;
    throw error;
  }
  return data;
}

export async function retryAttempt(attemptId) {
  const res = await fetch(`${API_BASE}/attempts/${attemptId}/retry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Retry evaluation failed');
    error.attempt = data.attempt;
    throw error;
  }
  return data;
}

export async function fetchAttempts() {
  const res = await fetch(`${API_BASE}/attempts`);
  if (!res.ok) throw new Error('Failed to fetch attempt history');
  return res.json();
}

export async function fetchAttemptById(id) {
  const res = await fetch(`${API_BASE}/attempts/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Attempt '${id}' not found`);
  }
  return res.json();
}
