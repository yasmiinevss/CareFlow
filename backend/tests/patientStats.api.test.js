import { describe, test,beforeEach,after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import resetDatabase from './utils/resetDb.js';
import pool from '../src/db/pool.js';

const ONE_DAY = 24 * 60 * 60 * 1000;

async function createPatient(lastName, firstName) {
  const res = await request(app)
    .post('/api/patients')
    .send({ last_name: lastName, first_name: firstName });
  assert.equal(res.status, 201, `Patient creation failed: ${JSON.stringify(res.body)}`);
  return res.body.id;
}

async function createAppointment(patientId, status = 'scheduled') {
  const created = await request(app).post('/api/appointments').send({
    patient_id: patientId,
    doctor_name: 'Dr. Martin',
    scheduled_at: new Date(Date.now() + ONE_DAY).toISOString(),
    duration_minutes: 30,
    consultation_type: 'follow_up',
  });
  assert.equal(created.status, 201, `Appointment creation failed: ${JSON.stringify(created.body)}`);

  if (status !== 'scheduled') {
    const updated = await request(app)
      .patch(`/api/appointments/${created.body.id}`)
      .send({ status });
    assert.equal(updated.status, 200, `Status change failed: ${JSON.stringify(updated.body)}`);
  }
}

async function getStats(patientId) {
  return request(app).get(`/api/patients/${patientId}/stats`);
}

describe('GET /api/patients/:id/stats', () => {
  let patientId;

  beforeEach(async () => {
    await resetDatabase();
    patientId = await createPatient('Doe', 'John');
  });

  after(() => pool.end());

  test('returns zero for every counter when the patient has no appointments', async () => {
    const res = await getStats(patientId);

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { completed: 0, noShow: 0, cancelled: 0, upcoming: 0 });
  });

  test('counts an upcoming appointment', async () => {
    await createAppointment(patientId);

    const res = await getStats(patientId);

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { completed: 0, noShow: 0, cancelled: 0, upcoming: 1 });
  });

  test('counts a cancelled appointment', async () => {
    await createAppointment(patientId, 'cancelled');

    const res = await getStats(patientId);

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { completed: 0, noShow: 0, cancelled: 1, upcoming: 0 });
  });

  test('counts a no-show appointment', async () => {
    await createAppointment(patientId, 'no_show');

    const res = await getStats(patientId);

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { completed: 0, noShow: 1, cancelled: 0, upcoming: 0 });
  });

  test('counts a completed appointment', async () => {
    await createAppointment(patientId, 'completed');

    const res = await getStats(patientId);

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { completed: 1, noShow: 0, cancelled: 0, upcoming: 0 });
  });

  test('counts all appointment types together', async () => {
    await createAppointment(patientId, 'completed');
    await createAppointment(patientId, 'no_show');
    await createAppointment(patientId, 'cancelled');
    await createAppointment(patientId);

    const res = await getStats(patientId);

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { completed: 1, noShow: 1, cancelled: 1, upcoming: 1 });
  });


test('returns 404 when the patient does not exist', async () => {
  const res = await getStats(999);
  console.log(res.body);
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, 'NOT_FOUND');
});
});

test('returns 400 when the patient id is not a positive integer', async () => {
  const res = await getStats('-1');

  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
});