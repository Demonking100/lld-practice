const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db/database');

describe('API Integration Tests', () => {
  let createdAttemptId;

  test('GET /problems returns seeded problems', async () => {
    const res = await request(app).get('/problems');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body.some(p => p.id === 'prob_parking_lot')).toBe(true);
  });

  test('POST /problems/:id/attempts creates an attempt with status in_progress', async () => {
    const res = await request(app).post('/problems/prob_parking_lot/attempts');
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('in_progress');
    expect(res.body.problemId).toBe('prob_parking_lot');

    createdAttemptId = res.body.id;
  });

  test('POST /attempts/:id/submit rejects empty submission with 400 validation error', async () => {
    const res = await request(app)
      .post(`/attempts/${createdAttemptId}/submit`)
      .send({ submissionText: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Validation Error');

    // Verify attempt status remains in_progress
    const attemptRes = await request(app).get(`/attempts/${createdAttemptId}`);
    expect(attemptRes.body.status).toBe('in_progress');
  });

  test('POST /attempts/:id/submit handles failed evaluation and transition to failed status', async () => {
    const res = await request(app)
      .post(`/attempts/${createdAttemptId}/submit`)
      .send({
        submissionText: 'Class ParkingLot with Vehicle and Slot [SIMULATE_FAILURE]',
        simulateFailure: true
      });

    expect(res.status).toBe(500);
    expect(res.body.attempt).toBeDefined();
    expect(res.body.attempt.status).toBe('failed');

    // Verify attempt in DB is now failed
    const attemptRes = await request(app).get(`/attempts/${createdAttemptId}`);
    expect(attemptRes.body.status).toBe('failed');
  });

  test('POST /attempts/:id/retry transitions failed attempt back to evaluated', async () => {
    const res = await request(app)
      .post(`/attempts/${createdAttemptId}/retry`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('evaluated');
    expect(res.body.feedback).toBeDefined();
    expect(res.body.feedback.completenessScore).toBeGreaterThanOrEqual(0);

    // Verify attempt in DB is evaluated
    const attemptRes = await request(app).get(`/attempts/${createdAttemptId}`);
    expect(attemptRes.body.status).toBe('evaluated');
  });
});
