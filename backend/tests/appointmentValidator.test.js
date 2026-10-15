import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateNewAppointment,
  validateAppointmentUpdate,
} from '../src/validators/appointmentsValidator.js';

const ONE_DAY = 24 * 60 * 60 * 1000;
const tomorrow = new Date(Date.now() + ONE_DAY).toISOString();
const yesterday = new Date(Date.now() - ONE_DAY).toISOString();

const validationError = { statusCode: 400, code: 'VALIDATION_ERROR' };

const validAppointment = {
  patient_id: 1,
  doctor_name: 'Dr. Martin',
  scheduled_at: tomorrow,
  duration_minutes: 30,
  consultation_type: 'follow_up',
};

describe('validateNewAppointment', () => {
  test('accepts a valid appointment', () => {
    const result = validateNewAppointment(validAppointment);

    assert.equal(result.patient_id, 1);
    assert.equal(result.doctor_name, 'Dr. Martin');
    assert.ok(result.scheduled_at instanceof Date);
  });

  test('ignores a status sent by the client', () => {
    const result = validateNewAppointment({ ...validAppointment, status: 'completed' });

    assert.equal('status' in result, false);
  });

  test('rejects a date in the past', () => {
    assert.throws(
      () => validateNewAppointment({ ...validAppointment, scheduled_at: yesterday }),
      validationError
    );
  });

  test('rejects an invalid date', () => {
    assert.throws(
      () => validateNewAppointment({ ...validAppointment, scheduled_at: 'tomorrow' }),
      validationError
    );
  });

  test('rejects a duration below the minimum', () => {
    assert.throws(
      () => validateNewAppointment({ ...validAppointment, duration_minutes: 10 }),
      validationError
    );
  });

  test('accepts the minimum and maximum durations', () => {
    assert.doesNotThrow(() => validateNewAppointment({ ...validAppointment, duration_minutes: 15 }));
    assert.doesNotThrow(() => validateNewAppointment({ ...validAppointment, duration_minutes: 30 }));
  });

  test('rejects an unknown consultation type', () => {
    assert.throws(
      () => validateNewAppointment({ ...validAppointment, consultation_type: 'checkup' }),
      validationError
    );
  });

  test('rejects a patient_id sent as a string', () => {
    assert.throws(
      () => validateNewAppointment({ ...validAppointment, patient_id: '1' }),
      validationError
    );
  });
});

describe('validateAppointmentUpdate', () => {
  test('returns only the fields that were sent', () => {
    const result = validateAppointmentUpdate({ status: 'cancelled' });

    assert.deepEqual(result, { status: 'cancelled' });
  });

  test('rejects an empty body', () => {
    assert.throws(() => validateAppointmentUpdate({}), validationError);
  });

  test('rejects a field that cannot be updated', () => {
    assert.throws(() => validateAppointmentUpdate({ patient_id: 4 }), validationError);
  });

  test('rejects created_at even alongside a valid field', () => {
    assert.throws(
      () => validateAppointmentUpdate({ status: 'cancelled', created_at: tomorrow }),
      validationError
    );
  });

  test('rejects an unknown status', () => {
    assert.throws(() => validateAppointmentUpdate({ status: 'done' }), validationError);
  });

  test('rejects a new date in the past', () => {
    assert.throws(() => validateAppointmentUpdate({ scheduled_at: yesterday }), validationError);
  });
});