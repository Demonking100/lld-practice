const fs = require('fs');
const path = require('path');
const { crypto } = require('crypto');

const DB_FILE = path.join(__dirname, 'data.json');

const INITIAL_PROBLEMS = [
  {
    id: 'prob_parking_lot',
    title: 'Design a Parking Lot',
    description: 'Design an automated multi-floor parking lot system supporting different vehicle types (Car, Bike, Truck). The system should handle spot allocation, entry/exit ticket generation, and parking fee calculation.',
    expectedEntities: ['Vehicle', 'Slot', 'Spot', 'ParkingLot', 'Ticket'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prob_elevator',
    title: 'Design an Elevator System',
    description: 'Design an elevator control system managing multiple elevator cars across multiple floors. The system should efficiently dispatch elevator requests, control floor movement, handle direction state, and manage internal/external request queues.',
    expectedEntities: ['Elevator', 'Floor', 'Request', 'Controller'],
    createdAt: new Date().toISOString()
  }
];

class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        problems: INITIAL_PROBLEMS,
        attempts: []
      };
      this.saveData(initialData);
    } else {
      // Ensure seed problems exist even if data.json was pre-existing
      const data = this.loadData();
      if (!data.problems || data.problems.length === 0) {
        data.problems = INITIAL_PROBLEMS;
        this.saveData(data);
      }
    }
  }

  loadData() {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Error reading database file, resetting:', err);
      const defaultData = { problems: INITIAL_PROBLEMS, attempts: [] };
      this.saveData(defaultData);
      return defaultData;
    }
  }

  saveData(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Problem queries
  getProblems() {
    const data = this.loadData();
    return data.problems || [];
  }

  getProblemById(id) {
    const problems = this.getProblems();
    return problems.find(p => p.id === id) || null;
  }

  // Attempt queries
  getAttempts() {
    const data = this.loadData();
    return data.attempts || [];
  }

  getAttemptById(id) {
    const attempts = this.getAttempts();
    return attempts.find(a => a.id === id) || null;
  }

  createAttempt(attemptData) {
    const data = this.loadData();
    data.attempts.push(attemptData);
    this.saveData(data);
    return attemptData;
  }

  updateAttempt(id, updates) {
    const data = this.loadData();
    const index = data.attempts.findIndex(a => a.id === id);
    if (index === -1) return null;

    data.attempts[index] = {
      ...data.attempts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveData(data);
    return data.attempts[index];
  }
}

module.exports = new Database();
