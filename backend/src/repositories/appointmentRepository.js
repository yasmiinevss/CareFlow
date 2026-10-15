import pool from '../db/pool.js';

export async function findAll() {
  const result = await pool.query(
    `SELECT id, patient_id, doctor_name, scheduled_at, duration_minutes,
            consultation_type, status, created_at
     FROM appointments
     ORDER BY scheduled_at`
  );
  return result.rows;
}

export async function findById(id) {
  const result = await pool.query(
    `SELECT id, patient_id, doctor_name, scheduled_at, duration_minutes,
            consultation_type, status, created_at
     FROM appointments
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function create(appointment) {
  const { patient_id, doctor_name, scheduled_at, duration_minutes, consultation_type } = appointment;
  const result = await pool.query(
    `INSERT INTO appointments (patient_id, doctor_name, scheduled_at, duration_minutes, consultation_type)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, patient_id, doctor_name, scheduled_at, duration_minutes,
               consultation_type, status, created_at`,
    [patient_id, doctor_name, scheduled_at, duration_minutes, consultation_type]
  );
  return result.rows[0];
} 

export async function update(id, changes) {
  const fields = Object.keys(changes);
  const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
  const values = fields.map((field) => changes[field]);

  const result = await pool.query(
    `UPDATE appointments
     SET ${setClause}
     WHERE id = $${fields.length + 1}
     RETURNING id, patient_id, doctor_name, scheduled_at, duration_minutes,
               consultation_type, status, created_at`,
    [...values, id]
  );
  return result.rows[0];
}