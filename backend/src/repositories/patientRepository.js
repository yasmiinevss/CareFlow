import pool from '../../db/pool.js';

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
