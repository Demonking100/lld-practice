const RuleBasedEvaluator = require('../src/evaluators/RuleBasedEvaluator');

describe('RuleBasedEvaluator', () => {
  let evaluator;
  const mockParkingLotProblem = {
    id: 'prob_parking_lot',
    title: 'Design a Parking Lot',
    description: 'Design a multi-floor parking lot system supporting different vehicle types.',
    expectedEntities: ['Vehicle', 'Slot', 'Spot', 'ParkingLot', 'Ticket']
  };

  beforeEach(() => {
    evaluator = new RuleBasedEvaluator();
  });

  test('returns a valid FeedbackResult for a normal valid submission', () => {
    const submissionText = `
      # Parking Lot Design
      We define a class ParkingLot which contains multiple Floor instances.
      Each Floor has multiple Slot or Spot instances for different Vehicle types (Car, Bike, Truck).
      When a Vehicle enters, a Ticket is issued with entry timestamp and allocated Slot ID.
    `;

    const result = evaluator.evaluate(submissionText, mockParkingLotProblem);

    expect(result).toBeDefined();
    expect(typeof result.completenessScore).toBe('number');
    expect(typeof result.structureScore).toBe('number');
    expect(result.completenessScore).toBeGreaterThanOrEqual(0);
    expect(result.completenessScore).toBeLessThanOrEqual(100);
    expect(result.structureScore).toBeGreaterThanOrEqual(0);
    expect(result.structureScore).toBeLessThanOrEqual(100);

    expect(Array.isArray(result.matchedEntities)).toBe(true);
    expect(Array.isArray(result.missingEntities)).toBe(true);
    expect(Array.isArray(result.comments)).toBe(true);

    expect(result.matchedEntities).toContain('Vehicle');
    expect(result.matchedEntities).toContain('ParkingLot');
    expect(result.matchedEntities).toContain('Ticket');
  });

  test('identifies missing entities for an incomplete submission', () => {
    const submissionText = `
      Simple parking lot design with basic classes.
    `;

    const result = evaluator.evaluate(submissionText, mockParkingLotProblem);

    expect(result.missingEntities.length).toBeGreaterThan(0);
    expect(result.comments.some(c => c.includes('missing key entities'))).toBe(true);
  });

  test('evaluates pseudocode algorithms and returns pseudocodeScore & pseudocodeMetrics', () => {
    const pseudocodeText = `
      CLASS ParkingLot {
        PRIVATE slots: Array of Slot
        
        FUNCTION parkVehicle(vehicle: Vehicle): Ticket {
          IF slots IS EMPTY THEN
            RETURN null
          END IF

          FOR EACH slot IN slots DO
            IF slot.isAvailable() THEN
              slot.occupy(vehicle)
              RETURN new Ticket(vehicle, slot)
            END IF
          END FOR
          RETURN null
        }
      }
    `;

    const result = evaluator.evaluate(pseudocodeText, mockParkingLotProblem, { submissionType: 'pseudocode' });

    expect(result.pseudocodeScore).toBeGreaterThanOrEqual(50);
    expect(result.pseudocodeMetrics).toBeDefined();
    expect(result.pseudocodeMetrics.functionsFound).toBeGreaterThanOrEqual(1);
    expect(result.pseudocodeMetrics.controlFlowsFound).toBeGreaterThanOrEqual(2);
    expect(result.pseudocodeMetrics.dataStructuresFound).toBeGreaterThanOrEqual(1);
    expect(result.pseudocodeMetrics.returnsFound).toBeGreaterThanOrEqual(2);
    expect(result.matchedEntities).toContain('ParkingLot');
    expect(result.matchedEntities).toContain('Vehicle');
    expect(result.matchedEntities).toContain('Ticket');
  });
});
