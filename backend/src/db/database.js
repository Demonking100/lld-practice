const fs = require('fs');
const path = require('path');
const { crypto } = require('crypto');

const DB_FILE = path.join(__dirname, 'data.json');

const INITIAL_PROBLEMS = [
  {
    id: 'prob_parking_lot',
    title: 'Design a Parking Lot',
    description: `Design an automated multi-floor parking lot system for urban commercial buildings.

Key Requirements:
- Support multiple vehicle types (Car, Bike, Truck) with designated spot sizes per floor.
- Track available and occupied spots per floor in real-time.
- Issue entry tickets with spot assignment and timestamp; calculate fees on exit based on duration.
- Gracefully handle full lot edge cases when no spots are available.

What a good submission should cover:
Your design should show how vehicles get matched to spots, how the system tracks occupancy, and how fees are calculated for different vehicle types.`,
    expectedEntities: ['Vehicle', 'Slot', 'Spot', 'ParkingLot', 'Ticket'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prob_elevator',
    title: 'Design an Elevator System',
    description: `Design a smart elevator control system managing multi-car dispatching in a high-rise building.

Key Requirements:
- Control multiple elevators across multiple floors.
- Process internal destination buttons and external floor hall requests (up/down).
- Efficiently dispatch requests to optimal elevators to minimize wait times.
- Manage movement states (Idle, Moving Up, Moving Down), door logic, and queue priorities.

What a good submission should cover:
Your design should cover request dispatching logic, state transitions, queue handling, and class relationships between controllers, floors, and elevators.`,
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
      // Ensure seed problems have updated rich descriptions while preserving existing attempts
      const data = this.loadData();
      data.problems = INITIAL_PROBLEMS;
      this.saveData(data);
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
