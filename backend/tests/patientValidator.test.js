import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePatient } from '../src/validators/patientValidator.js';

describe('validatePatient', () => {
  test('returns trimmed names for valid input', () => {
    const result = validatePatient({ last_name: '  Durand  ', first_name: 'Marie' });

    assert.deepEqual(result, { last_name: 'Durand', first_name: 'Marie' });
  });

  test('rejects a name containing digits', () => {
    assert.throws(
      () => validatePatient({ last_name: 'Dur4nd', first_name: 'Marie' }),
      { statusCode: 400, code: 'VALIDATION_ERROR' }
    );
  });
});