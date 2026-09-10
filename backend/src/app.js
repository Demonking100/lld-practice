const express = require('express');
const cors = require('cors');
const problemsRouter = require('./routes/problems');
const attemptsRouter = require('./routes/attempts');

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/problems', problemsRouter);
app.use('/attempts', attemptsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

module.exports = app;
