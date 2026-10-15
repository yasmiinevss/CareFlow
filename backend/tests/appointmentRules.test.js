import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { assertUpdateAllowed } from '../src/services/appointmentRules.js';

const invalidTransition = { statusCode: 409, code: 'INVALID_TRANSITION' };
const FINAL_STATES = ['cancelled', 'completed', 'no_show'];

describe('assertUpdateAllowed', () => {
  for (const target of FINAL_STATES) {
    test(`allows scheduled → ${target}`, () => {
      assert.doesNotThrow(() => assertUpdateAllowed('scheduled', { status: target }));
    });
  }

  test('allows rescheduling a scheduled appointment', () => {
    assert.doesNotThrow(() =>
      assertUpdateAllowed('scheduled', { duration_minutes: 15 })
    );
  });

  for (const current of FINAL_STATES) {
    test(`rejects any change to a ${current} appointment`, () => {
      assert.throws(
        () => assertUpdateAllowed(current, { duration_minutes: 15 }),
        invalidTransition
      );
    });

    test(`rejects ${current} → scheduled`, () => {
      assert.throws(
        () => assertUpdateAllowed(current, { status: 'scheduled' }),
        invalidTransition
      );
    });
  }

  test('rejects scheduled → scheduled', () => {
    assert.throws(
      () => assertUpdateAllowed('scheduled', { status: 'scheduled' }),
      invalidTransition
    );
  });
});