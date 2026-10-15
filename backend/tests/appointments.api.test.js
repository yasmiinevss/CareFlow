import { describe, test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import request from 'supertest';
import app from '../src/app.js';
import pool from '../db/pool.js';

const ONE_DAY = 24 * 60 * 60 * 1000;
const tomorrow = new Date(Date.now() + ONE_DAY).toISOString();

async function resetDatabase() {
  const schema = await readFile(new URL('../db/schema.sql', import.meta.url), 'utf8');
  const seed = await readFile(new URL('../db/seed.sql', import.meta.url), 'utf8');
  await pool.query(schema);
  await pool.query(seed);
}

// Seed data reminder:
// 1 = scheduled, 2 = completed, 3 = scheduled, 4 = no_show, 5 = cancelled

describe('PATCH /api/appointments/:id', () => {
  beforeEach(resetDatabase);
  after(() => pool.end());

  test('cancels a scheduled appointment', async () => {
    const res = await request(app)
      .patch('/api/appointments/1')
      .send({ status: 'cancelled' });

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'cancelled');
  });

  test('persists the change in the database', async () => {
    await request(app).patch('/api/appointments/1').send({ status: 'cancelled' });

    const res = await request(app).get('/api/appointments/1');

    assert.equal(res.body.status, 'cancelled');
  });

  test('reschedules a scheduled appointment', async () => {
    const res = await request(app)
      .patch('/api/appointments/3')
      .send({ scheduled_at: tomorrow, duration_minutes: 15 });

    assert.equal(res.status, 200);
    assert.equal(res.body.duration_minutes, 15);
    assert.equal(new Date(res.body.scheduled_at).getTime(), new Date(tomorrow).getTime());
  });

  test('rejects a forbidden transition from a final state', async () => {
    const res = await request(app)
      .patch('/api/appointments/5')
      .send({ status: 'scheduled' });

    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, 'INVALID_TRANSITION');
  });

  test('rejects any change to a completed appointment', async () => {
    const res = await request(app)
      .patch('/api/appointments/2')
      .send({ duration_minutes: 15 });

    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, 'INVALID_TRANSITION');
  });

  test('rejects a transition between two final states', async () => {
    const res = await request(app)
      .patch('/api/appointments/4')
      .send({ status: 'completed' });

    assert.equal(res.status, 409);
  });

  test('returns 404 for an appointment that does not exist', async () => {
    const res = await request(app)
      .patch('/api/appointments/999')
      .send({ status: 'cancelled' });

    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  test('rejects a field that cannot be updated', async () => {
    const res = await request(app)
      .patch('/api/appointments/3')
      .send({ patient_id: 4 });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  test('rejects an invalid id', async () => {
    const res = await request(app)
      .patch('/api/appointments/abc')
      .send({ status: 'cancelled' });

    assert.equal(res.status, 400);
  });
});