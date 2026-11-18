import pool from '../db/pool.js';

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
  const result = await pool.query(
    `SELECT
      COUNT(*) FILTER (WHERE status = 'completed')::int AS "completed",
      COUNT(*) FILTER (WHERE status = 'no_show')::int AS "noShow",
      COUNT(*) FILTER (WHERE status = 'cancelled')::int AS "cancelled",
      COUNT(*) FILTER (WHERE status = 'upcoming')::int AS "upcoming"
     FROM appointments
     WHERE patient_id = $1`,
    [patientId]
  );
  return result.rows[0];
}
