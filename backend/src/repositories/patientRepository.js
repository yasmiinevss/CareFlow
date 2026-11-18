import pool from '../db/pool.js';
import { notFound } from '../middlewares/notFound.js';
import { AppError } from '../utils/AppError.js';

export async function findAll() {
  const result = await pool.query(
    `SELECT id, first_name, last_name,created_at
     FROM patients
     ORDER BY  last_name,first_name`
  );
  return result.rows;
}

export async function findById(id) {
  const result = await pool.query(
    `SELECT id, first_name, last_name, created_at
     FROM patients
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function createPatient(firstName, lastName) {
  const result = await pool.query(
    `INSERT INTO patients (first_name, last_name)
     VALUES ($1, $2)
     RETURNING id, first_name, last_name, created_at`,
    [firstName, lastName]
  );
  return result.rows[0];
}

export async function getStatsByPatientId(patientId) {
  const patient = await findById(patientId);
  if(patient === undefined) {
    throw new AppError(404, 'NOT_FOUND', `Patient ${patientId} not found`);
  };
  if (patientId <= 0 || !Number.isInteger(patientId)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Patient id must be a positive integer');
  };
  const result = await pool.query(
    `SELECT 
      COUNT(*) FILTER (WHERE status = 'completed')::int AS "completed",
      COUNT(*) FILTER (WHERE status = 'no_show')::int AS "noShow",
      COUNT(*) FILTER (WHERE status = 'cancelled')::int AS "cancelled",
      COUNT(*) FILTER (WHERE status = 'scheduled')::int AS "upcoming"
     FROM appointments
     WHERE patient_id = $1`,
    [patientId]
  );
  return result.rows[0];
}

