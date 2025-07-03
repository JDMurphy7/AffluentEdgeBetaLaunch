import { validateEntry } from '@aeopt/journal/compatibility';
import { isSafeInput } from '@aeopt/utils/validation';

describe('Validation Utility', () => {
  test('Trade validation prevents invalid data entry', () => {
    const valid = { timestamp: '2025-07-02T00:00:00Z', userId: 'user1', tradeDetails: {} };
    const invalid = { timestamp: 123, userId: null, tradeDetails: {} };
    expect(validateEntry(valid)).toBe(true);
    expect(validateEntry(invalid)).toBe(false);
  });

  test('Input validation prevents injection attacks', () => {
    const safe = 'user1';
    const unsafe = 'user1; DROP TABLE users;';
    expect(isSafeInput(safe)).toBe(true);
    expect(isSafeInput(unsafe)).toBe(false);
  });
});
